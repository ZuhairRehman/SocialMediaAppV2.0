import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from '@/constants/theme';
import { hp, stripHtmlTags, wp } from '@/helpers/common';
import AvatarComp from './Avatar_Comp';
import moment from 'moment';
import Icon from '@/assets/icons';
import RenderHtml from 'react-native-render-html';
import { Image } from 'expo-image';
import { downloadFile, getSupabaseFileUrl } from '@/services/ImageService';
import { Video } from 'expo-av';
import { createPostLike, removePostLike } from '@/services/PostService';
import LoadingIndicatorComponent from './LoadingIndicator_Comp';

//textStyles
const textStyle = {
    color: theme.colors.dark,
    size: hp(1.75),
};

//tagsStyles
const tagStyles = {
    div: textStyle,
    p: textStyle,
    ol: textStyle,
    h1: {
        color: theme.colors.dark,
    },
    h4: {
        color: theme.colors.dark,
    },
};

//shadow styles for posts card UI
const shadowStyles = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
};

const Post_Card_Comp = ({
    item,
    currentUser,
    router,
    hasShadow = true,
    showExtraIcon = true,
    showDelete = true,
    onDelete = () => {},
    onEdit = () => {},
}) => {
    //console.log('posts data', item?.comments);

    //Constants & variables
    const [likes, setLikes] = useState<{ userId: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const createdAt = moment(item?.created_at).format('MMM D, h:mm A'); // moment library specific
    const liked =
        likes?.length && likes.filter(like => like.userId == currentUser.id)[0] ? true : false;
    //console.log('post item:', item);

    //API functions

    //Function to Share post
    const onShare = async () => {
        let content = { message: stripHtmlTags(item?.body) };
        if (item?.file) {
            //console.log('file', item.file);
            //download the file then share the local file uri
            setLoading(true);
            let url = await downloadFile(getSupabaseFileUrl(item?.file)?.uri);
            setLoading(false);
            content.url = url;
            //console.log('url', url);
        }
        Share.share(content);
    };

    //hook for setting likes count  //Encountered bug in code below. Applying conditional setLikes count here
    useEffect(() => {
        if (item?.id) {
            setLikes(item?.post_likes);
        }
    }, []);

    //Function to like post
    const onLike = async () => {
        if (liked) {
            //remove likes
            let updatedLikes = likes.filter(like => like.userId != currentUser?.id);
            setLikes([...updatedLikes]);
            let resp = await removePostLike(item?.id, currentUser?.id);
            //console.log('response:', resp);
            if (!resp.success) {
                Alert.alert('Post', 'Something went wrong');
            }
        } else {
            //create a new like
            let data = {
                userId: currentUser?.id,
                postId: item?.id,
            };
            setLikes([...likes, data]);
            let resp = await createPostLike(data);
            //console.log('response:', resp);
            if (!resp.success) {
                Alert.alert('Post', 'Something went wrong');
            }
        }
    };

    //Function to delete a post
    const handlePostDelete = () => {
        Alert.alert('Confirm', 'Are you sure you want to delete?', [
            {
                text: 'No',
                onPress: () => {
                    console.log(' cancelled');
                },
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: () => onDelete(item),
                style: 'destructive',
            },
        ]);
    };

    // Function to open post details modal
    // This function will be used to navigate to the post details screen or open a modal with post details

    const openPostDetails = () => {
        // Add navigation or modal opening logic here
        router.push({ pathname: 'post-details', params: { postId: item?.id } });
    };

    return (
        <View style={[styles.container, hasShadow && shadowStyles]}>
            <View style={styles.header}>
                {/* User info & post time UI */}
                <View style={styles.userInfo}>
                    <AvatarComp
                        size={hp(4.5)}
                        uri={item?.user?.image}
                        rounded={theme.radius.md}
                    />
                    <View style={{ gap: 2 }}>
                        <Text style={styles.username}>{item?.user?.name}</Text>
                        <Text style={styles.postTime}>{createdAt}</Text>
                    </View>
                </View>

                {/* Edit Post button*/}
                {showExtraIcon && (
                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon
                            name='threeDotsHorizontal'
                            size={hp(3.4)}
                            strokeWidth={3}
                            color={theme.colors.text}
                        />
                    </TouchableOpacity>
                )}

                {showDelete && currentUser.id === item?.userId && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => onEdit(item)}>
                            <Icon
                                name='edit'
                                size={hp(2.5)}
                                color={theme.colors.text}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePostDelete}>
                            <Icon
                                name='delete'
                                size={hp(2.5)}
                                color={theme.colors.rose}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Post content UI */}
            <View style={styles.content}>
                <View style={styles.postBody}>
                    {item?.body && (
                        <RenderHtml
                            contentWidth={wp(100)}
                            source={{ html: item?.body }}
                            tagsStyles={tagStyles}
                        />
                    )}
                </View>
                {/* Post Image */}
                {item?.file && item?.file?.includes('postImages') && (
                    <Image
                        source={getSupabaseFileUrl(item?.file)}
                        transition={100}
                        style={styles.postMedia}
                        contentFit='cover'
                    />
                )}

                {/* Post Video */}
                {item?.file && item?.file?.includes('postVideos') && (
                    <Video
                        style={[styles.postMedia, { height: hp(30) }]}
                        source={getSupabaseFileUrl(item?.file)}
                        useNativeControls
                        resizeMode='cover'
                        isLooping
                    />
                )}
            </View>
            {/* Tags */}
            <View style={styles.footer}>
                {/*Likes UI*/}
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onLike}>
                        <Icon
                            name='heart'
                            size={24}
                            fill={liked ? theme.colors.rose : 'transparent'}
                            color={liked ? theme.colors.rose : theme.colors.textLight}
                        />
                    </TouchableOpacity>
                    <Text style={styles.count}>{likes?.length}</Text>
                </View>

                {/* Comment button UI*/}
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon
                            name='comment'
                            size={24}
                            color={theme.colors.textLight}
                        />
                    </TouchableOpacity>
                    <Text style={styles.count}>{item.comments[0]?.count} </Text>
                </View>

                {/*Share button UI*/}
                <View style={styles.footerButton}>
                    {loading ? (
                        <LoadingIndicatorComponent size='small' />
                    ) : (
                        <TouchableOpacity onPress={onShare}>
                            <Icon
                                name='share'
                                size={24}
                                color={theme.colors.textLight}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

export default Post_Card_Comp;

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: theme.radius.xxl * 1.1,
        borderCurve: 'continuous',
        padding: 10,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.5,
        borderColor: theme.colors.gray,
        shadowColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium,
    },
    postTime: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium,
    },
    content: {
        gap: 10,
    },
    postMedia: {
        height: hp(40),
        width: '100%',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
    },
    postBody: {
        marginLeft: 5,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8),
    },
});
