import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createComment, fetchPostDetails, removeComment, removePost } from '@/services/PostService';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import Post_Card_Comp from '@/components/Post-Card';
import { useAuth } from '@/Context-Store/Auth';
import LoadingIndicatorComponent from '@/components/LoadingIndicator_Comp';
import InputComp from '@/components/Input_Comp';
import Icon from '@/assets/icons';
import CommentItemComponent from '@/components/CommentItem_Comp';
import { supabase } from '@/libs/supabase';
import { getUserData } from '@/services/userService';
import { createNotification } from '@/services/NotificationsService';

const PostDetailsModal = () => {
    // State variables
    const [post, setPost] = useState(null);
    const [startLoading, setStartLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    //console.log('Post', post);

    //Refs for inputContainer
    const inputRef = useRef(null);
    const commentRef = useRef('');

    // Fetch post data based on post_id
    useEffect(() => {
        let commentChannel = supabase
            .channel('comments')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `postId=eq.${postId}`,
                },

                handleNewComment,
            )
            .subscribe();

        getPostDetails();

        return () => {
            supabase.removeChannel(commentChannel);
        };
    }, []);

    const getPostDetails = async () => {
        // Get post details
        let resp = await fetchPostDetails(postId); //put random id for tesing
        //console.log('got post details', resp);
        if (resp.success) setPost(resp.data);
    };

    //Hooks
    const { postId, commentId } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();

    // Util Functions

    //Handle new commentChannel
    const handleNewComment = async payload => {
        //console.log('got new comment: ', payload.new);
        if (payload.new) {
            let newComment = { ...payload.new };
            let resp = await getUserData(newComment.userId);
            newComment.user = resp.success ? resp.data : {};
            setPost(prevPost => {
                return {
                    ...prevPost,
                    comments: prevPost ? [newComment, ...prevPost.comments] : [newComment],
                };
            });
        }
    };

    //Create a new comment
    const onNewComment = async () => {
        if (!commentRef.current) return null;
        // Add comment to post
        //sending data to postgres table
        let data = {
            userId: user?.id,
            postId: post?.id,
            text: commentRef.current,
        };
        setLoading(true);
        let resp = await createComment(data);
        setLoading(false);
        if (resp.success) {
            if (user.id != post.userId) {
                //send a notification
                let notify = {
                    senderId: user.id,
                    receiverId: post.userId,
                    title: `commented on your post`,
                    data: JSON.stringify({ postId: post.id, commentId: resp?.data?.id }),
                };
                createNotification(notify);
            }
            inputRef?.current?.clear();
            commentRef.current = '';
        } else {
            Alert.alert('Comment:', resp.message);
        }
    };

    //Comment delete function

    const onDeleteComment = async comment => {
        console.log('comment deleted', comment);
        let resp = await removeComment(comment?.id);
        if (resp.success) {
            setPost(prevPost => {
                let updatedPost = { ...prevPost };
                updatedPost.comments = updatedPost.comments.filter(c => c.id !== comment?.id);
                return updatedPost;
            });
        } else {
            Alert.alert('Error:', resp.message);
        }
    };

    // Delete post function
    const onDeletePost = async item => {
        //console.log('delete post', item);
        let resp = await removePost(item.id);
        if (resp.success) {
            router.back();
        } else {
            Alert.alert('Post:', resp.message);
        }
    };

    // Edit post function
    const onEditPost = async item => {
        router.back();
        router.push({ pathname: 'new-posts', params: { ...item } });
    };

    if (startLoading) {
        return (
            <View style={styles.center}>
                <LoadingIndicatorComponent />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.center, { justifyContent: 'flex-start', marginTop: 100 }]}>
                <Text style={styles.notFound}>No post found.</Text>
            </View>
        );
    }

    //Component rendering

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
            >
                <Post_Card_Comp
                    item={{ ...post, comments: [{ count: post?.comments?.length }] }}
                    currentUser={user}
                    router={router}
                    hasShadow={false}
                    showExtraIcon={false}
                    showDelete={true}
                    onDelete={onDeletePost}
                    onEdit={onEditPost}
                />
                {/* Comment Input */}
                <View style={styles.inputContainer}>
                    <InputComp
                        onChangeText={value => (commentRef.current = value)}
                        inputRef={inputRef}
                        placeholder='Write a comment...'
                        placeholderTextColor={theme.colors.textLight}
                        containerStyle={{ flex: 1, height: hp(6.2), borderRadius: theme.radius.xl }}
                    />
                    {loading ? (
                        <View style={styles.loading}>
                            <LoadingIndicatorComponent size='small' />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.sendIcon}
                            onPress={onNewComment}
                        >
                            <Icon
                                name='send'
                                color={theme.colors.primaryDark}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Comments list */}
                <View style={{ marginVertical: 15, gap: 17 }}>
                    {post?.comments?.map(comment => (
                        <CommentItemComponent
                            key={comment?.id?.toString()}
                            item={comment}
                            canDelete={user?.id == comment.userId || user?.id == post.userId}
                            highlight={comment.id == commentId}
                            onDelete={onDeleteComment}
                        />
                    ))}
                    {post?.comments?.length === 0 && (
                        <Text style={{ textAlign: 'center' }}>No comments yet.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default PostDetailsModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: wp(7),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    list: {
        paddingHorizontal: wp(4),
    },
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: hp(5.8),
        height: hp(5.8),
        borderRadius: theme.radius.lg,
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderCurve: 'continuous',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFound: {
        fontSize: hp(2.7),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium,
    },
    loading: {
        height: hp(5.8),
        width: hp(5.8),
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: 1.3 }],
    },
});
