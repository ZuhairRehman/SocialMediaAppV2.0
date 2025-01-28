import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import ScreenWrapper from '@/components/Screen_Wrapper';
import { useAuth } from '@/Context-Store/Auth';
import { theme } from '@/constants/theme';
import { hp, wp } from '@/helpers/common';
import Icon from '@/assets/icons';
import { useRouter } from 'expo-router';
import AvatarComp from '@/components/Avatar_Comp';
import { useEffect, useState } from 'react';
import { fetchPosts } from '@/services/PostService';
import Post_Card_Comp from '@/components/Post-Card';
import LoadingIndicatorComponent from '@/components/LoadingIndicator_Comp';
import { supabase } from '@/libs/supabase';
import { getUserData } from '@/services/userService';

//global variables
var limit = 0;
const HomeScreen = () => {
    // Constants & Variables
    const { user, setAuth } = useAuth();
    const router = useRouter();

    //State Variables
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [notificationsCount, setNotificationsCount] = useState(0);

    // Fetching posts on mount

    const handlePostEvent = async payload => {
        //console.log('payload', payload);
        if (payload.eventType === 'INSERT' && payload?.new?.id) {
            let newPost = { ...payload.new };
            let resp = await getUserData(newPost.userId);
            newPost.postLikes = [];
            newPost.comments = [{ count: 0 }];
            newPost.user = resp.success ? resp.data : {};
            setPosts(prevPosts => [newPost, ...prevPosts]);
        }
        if (payload.eventType === 'DELETE' && payload.old.id) {
            setPosts(prevPosts => {
                let updatedPosts = prevPosts.filter(post => post.id != payload.old.id);
                return updatedPosts;
            });
        }
        if (payload.eventType === 'UPDATE' && payload?.new?.id) {
            setPosts(prevPosts => {
                let updatedPosts = prevPosts.map(post => {
                    if (post.id == payload.new.id) {
                        post.body = payload.new.body;
                        post.file = payload.new.file;
                    }
                    return post;
                });
                return updatedPosts;
            });
        }
    };

    //Notifications function
    const handleNewNotification = async payload => {
        console.log('got new notification', payload);
        if (payload.eventType == 'INSERT' && payload.new.id) {
            setNotificationsCount(prevCount => prevCount + 1);
        }
    };

    useEffect(() => {
        let postChannel = supabase
            .channel('posts')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'posts' },
                handlePostEvent,
            )
            .subscribe();
        //getPosts(); no longer needed in useEffect as it is being called below

        let notificationsChannel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `receiverId=eq.${user.id}`,
                },
                handleNewNotification,
            )
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(notificationsChannel);
        };
    }, []);

    //  util functions

    const getPosts = async () => {
        if (!hasMore) return null;
        // call api & limit post count
        limit = limit + 4;
        let resp = await fetchPosts(limit);

        //console.log('got posts', resp);
        //console.log('user: ', resp.data[0].user);

        if (resp.success) {
            if (posts.length == resp.data.length) setHasMore(false);
            setPosts(resp.data);
        }
    };

    //console.log('user: ', user);

    return (
        <ScreenWrapper bg='#FFF'>
            <View style={styles.container}>
                {/* Header*/}
                <View style={styles.header}>
                    <Text style={styles.title}>Linkup</Text>
                    <View style={styles.icons}>
                        <Pressable onPress={() => router.push('/notifications')}>
                            <Icon //custom icon comp
                                name='heart'
                                size={hp(3.2)}
                                strokeWidth={2}
                                color={theme.colors.text}
                            />
                            {notificationsCount > 0 && (
                                <View style={styles.pill}>
                                    <Text style={styles.pillText}>{notificationsCount}</Text>
                                </View>
                            )}
                        </Pressable>
                        <Pressable onPress={() => router.push('/new-posts')}>
                            <Icon //custom icon comp
                                name='plus'
                                size={hp(3.2)}
                                strokeWidth={2}
                                color={theme.colors.text}
                            />
                        </Pressable>
                        <Pressable onPress={() => router.push('/profile')}>
                            <AvatarComp //Custom Avatar_Comp
                                uri={user?.image}
                                size={hp(4.3)}
                                rounded={theme.radius.sm}
                                style={{ borderWidth: 2 }}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Posts */}
                <FlatList
                    data={posts}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listStyle}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <Post_Card_Comp
                            item={{ ...item, comment: [{ count: item?.comment?.length }] }}
                            currentUser={user}
                            router={router}
                        />
                    )}
                    onEndReached={() => {
                        getPosts();
                        //console.log('got to end');
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        hasMore ? (
                            <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                                <LoadingIndicatorComponent />
                            </View>
                        ) : (
                            <View style={{ marginVertical: 30 }}>
                                <Text style={styles.noPosts}>No more posts</Text>
                            </View>
                        )
                    }
                />
            </View>
        </ScreenWrapper>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //paddingHorizontal: wp(4),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginHorizontal: wp(4),
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(3.2),
        fontWeight: theme.fonts.bold,
    },
    avatarImage: {
        height: hp(4.3),
        width: hp(4.3),
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        borderColor: theme.colors.gray,
        borderWidth: 3,
    },
    icons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 18,
    },
    listStyle: {
        paddingTop: 20,
        paddingHorizontal: wp(4),
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text,
    },
    pill: {
        position: 'absolute',
        right: -10,
        top: -4,
        height: hp(2.2),
        width: hp(2.2),
        borderRadius: 20,
        backgroundColor: theme.colors.roseLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pillText: {
        color: '#fff',
        fontSize: hp(1.2),
        fontWeight: theme.fonts.bold,
    },
});
