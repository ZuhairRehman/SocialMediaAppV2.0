import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Pressable,
    Alert,
} from 'react-native';
import ScreenWrapper from '@/components/Screen_Wrapper';
import HeaderComp from '@/components/Header_Comp';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import AvatarComp from '@/components/Avatar_Comp';
import { useAuth } from '@/Context-Store/Auth';
import RichTextEditorComp from '@/components/RichTextEditor_Comp';
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '@/assets/icons';
import ButtonComponent from '@/components/Button_Comp';
import * as ImagePicker from 'expo-image-picker';
import { getSupabaseFileUrl } from '@/services/ImageService';
import { Video } from 'expo-av';
import { createorUpdatePost } from '@/services/PostService';

const NewPostsScreen = () => {
    //Constant and Variables
    const router = useRouter();
    // Hooks
    const { user } = useAuth();
    const post = useLocalSearchParams();
    console.log('post params:', post);

    // References
    const bodyRef = useRef('');
    const editorRef = useRef(null);

    // State variables
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(file);

    useEffect(() => {
        if (post && post.id) {
            bodyRef.current = post.body;
            setFile(post.file || null);
            setTimeout(() => {
                editorRef.current.setContentHTML(post.body);
            }, 300);
        }
    }, []);

    // Function to handle file picking
    const onPick = async isImage => {
        let mediaConfig = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        };
        if (!isImage) {
            mediaConfig = {
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.7,
            };
        }
        let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

        if (!result.canceled) {
            setFile(result.assets[0]);
        }
    };

    //Function for local file
    const isLocalFile = file => {
        if (!file) return null;
        if (typeof file == 'object') return true;
        return false;
    };

    // Function to get file type
    const getFileType = file => {
        if (!file) return null;
        if (isLocalFile(file)) {
            return file.type;
        }
        //check image or video for remote file
        if (file.includes('postImages')) {
            return 'image';
        }
        return 'video';
    };

    // Function to get file uri

    const getFileUri = file => {
        if (!file) return null;
        if (isLocalFile(file)) {
            return file.uri;
        }
        return getSupabaseFileUrl(file)?.uri;
    };

    // Function to handle post submission
    const onSubmit = async () => {
        //console.log(bodyRef);
        //console.log(file);
        if (!bodyRef.current && !file) {
            Alert.alert('Post', 'Post a file or add a comment');
            return;
        }
        let data = {
            file,
            body: bodyRef.current,
            userId: user?.id,
        };

        if (post && post.id) data.id = post.id;

        setLoading(true);
        let resp = await createorUpdatePost(data);
        setLoading(false);

        if (resp.success) {
            setFile(null);
            bodyRef.current = '';
            editorRef.current?.setContentHTML('');
            router.back();
        } else {
            Alert.alert('Error', 'Failed to create post');
        }
        console.log('response:', data);
    };
    //console.log('file uri:', getFileUri(file));

    return (
        <ScreenWrapper bg='#fff'>
            <View style={styles.container}>
                <HeaderComp title='Create Post' />
                <ScrollView contentContainerStyle={{ gap: 20 }}>
                    {/* Avatar */}
                    <View style={styles.header}>
                        <AvatarComp
                            uri={user?.image}
                            size={hp(6.5)}
                            rounded={theme.radius.xl}
                        />
                        <View style={{ gap: 2 }}>
                            <Text style={styles.userName}>{user && user.name}</Text>
                            <Text style={styles.publicText}>Public</Text>
                        </View>
                    </View>

                    {/* Text Editor */}
                    <View style={styles.textEditor}>
                        <RichTextEditorComp
                            editorRef={editorRef}
                            onChange={body => (bodyRef.current = body)}
                        />
                    </View>
                    {file && (
                        <View style={styles.file}>
                            {getFileType(file) == 'video' ? (
                                <>
                                    <Video
                                        style={{ flex: 1 }}
                                        source={{ uri: getFileUri(file) }}
                                        useNativeControls
                                        resizeMode='cover'
                                        isLooping
                                    />
                                </>
                            ) : (
                                <>
                                    <Image
                                        source={{ uri: getFileUri(file) }}
                                        resizeMode='cover'
                                        style={{ flex: 1 }}
                                    />
                                </>
                            )}
                            <Pressable
                                style={styles.closeIcon}
                                onPress={() => setFile()}
                            >
                                <Icon
                                    name='delete'
                                    size={22}
                                    color='#fff'
                                />
                            </Pressable>
                        </View>
                    )}

                    <View style={styles.media}>
                        <Text style={styles.addImageText}>Add to your post</Text>
                        <View style={styles.mediaIcons}>
                            <TouchableOpacity onPress={() => onPick(true)}>
                                <Icon
                                    name='image'
                                    size={30}
                                    color={theme.colors.dark}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onPick(false)}>
                                <Icon
                                    name='video'
                                    size={33}
                                    color={theme.colors.dark}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                <ButtonComponent //Custom Button Component
                    buttonStyle={{ height: hp(6.2) }}
                    title={post && post.id ? 'Update' : 'Post'}
                    loading={loading}
                    hasShadow={false}
                    onPress={onSubmit}
                />
            </View>
        </ScreenWrapper>
    );
};

export default NewPostsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 30,
        paddingHorizontal: wp(4),
        gap: 15,
    },
    title: {
        //marginBottom: 10,
        fontSize: hp(2.5),
        fontWeight: theme.fonts.semiBold,
        color: theme.colors.text,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userName: {
        fontSize: hp(2.2),
        fontWeight: theme.fonts.semiBold,
        color: theme.colors.text,
    },
    avatar: {
        height: hp(6.5),
        width: hp(6.5),
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: theme.colors.textLight,
    },
    publicText: {
        fontSize: hp(1.7),
        fontWeight: theme.fonts.medium,
        color: theme.colors.textLight,
    },
    textEditor: {
        //marginTop: 10
    },
    media: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        padding: 18,
        paddingHorizontal: 20,
        borderRadius: theme.radius.xl,
        borderColor: theme.colors.gray,
        borderCurve: 'continuous',
    },
    mediaIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    addImageText: {
        fontSize: hp(1.9),
        fontWeight: theme.fonts.semiBold,
        color: theme.colors.text,
    },
    imageIcon: {
        //backgroundColor: theme.colors.gray,
        borderRadius: theme.radius.xl,
        // padding: 6,
    },
    file: {
        height: hp(30),
        width: '100%',
        borderRadius: theme.radius.xl,
        overflow: 'hidden',
        borderCurve: 'continuous',
    },
    video: {},
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 0, 0 , 0.5)',
        // shadowColor: theme.colors.textLight,
        // shadowOffset: { width: 0, height: 3 },
        // shadowOpacity: 0.6,
        // shadowRadius: 8,
    },
});
