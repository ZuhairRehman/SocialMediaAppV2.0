import Icon from '@/assets/icons';
import AvatarComp from '@/components/Avatar_Comp';
import HeaderComp from '@/components/Header_Comp';
import LoadingIndicatorComponent from '@/components/LoadingIndicator_Comp';
import Post_Card_Comp from '@/components/Post-Card';
import ScreenWrapper from '@/components/Screen_Wrapper';
import { theme } from '@/constants/theme';
import { useAuth } from '@/Context-Store/Auth';
import { hp, wp } from '@/helpers/common';
import { supabase } from '@/libs/supabase';
import { fetchPosts } from '@/services/PostService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';

// Limit Variable for posts
var limit = 0;

const ProfileScreen = () => {
    //Hooks
    const router = useRouter();
    const { user, setAuth } = useAuth();

    //State Variables
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);

    //Util functions

    const onLogout = async () => {
        // Perform logout logic here
        setAuth(null);
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error signing out:', error.message);
        }
    };

    const getPosts = async () => {
        if (!hasMore) return null;
        // call api & limit post count
        limit = limit + 4;
        let resp = await fetchPosts(limit, user.id);

        //console.log('got posts', resp);
        //console.log('user: ', resp.data[0].user);

        if (resp.success) {
            if (posts.length == resp.data.length) setHasMore(false);
            setPosts(resp.data);
        }
    };

    const handleLogout = async () => {
        //show confirm modal
        Alert.alert('Confirm', 'Are you sure you want to logout?', [
            {
                text: 'No',
                onPress: () => {
                    console.log('Modal cancelled');
                },
                style: 'cancel',
            },
            {
                text: 'logout',
                onPress: () => onLogout(),
                style: 'destructive',
            },
        ]);
    };

    return (
        <ScreenWrapper bg='#FFF'>
            <FlatList
                ListHeaderComponent={
                    <UserHeader
                        user={user}
                        router={router}
                        handleLogout={handleLogout}
                    />
                }
                ListHeaderComponentStyle={{ marginBottom: 50 }}
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
                        <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
                            <LoadingIndicatorComponent />
                        </View>
                    ) : (
                        <View style={{ marginVertical: 30 }}>
                            <Text style={styles.noPosts}>No more posts</Text>
                        </View>
                    )
                }
            />
        </ScreenWrapper>
    );
};

const UserHeader = ({ user, router, handleLogout }) => {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff', paddingHorizontal: wp(4) }}>
            <View>
                <HeaderComp //Custom Heaader
                    title='Profile'
                    mb={30}
                />
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Icon
                        name='logout'
                        color={theme.colors.rose}
                    />
                </TouchableOpacity>
            </View>

            {/* User profile Image */}
            <View style={styles.container}>
                <View style={{ gap: 15 }}>
                    <View style={styles.avatarContainer}>
                        <AvatarComp
                            uri={user?.image}
                            size={hp(12)}
                            rounded={theme.radius.xxl * 1.4}
                        />
                        <Pressable
                            style={styles.editIcon}
                            onPress={() => router.push('/edit-profile')}
                        >
                            <Icon
                                name='edit'
                                size={20}
                                color={theme.colors.textLight}
                                strokeWidth={2.5}
                            />
                        </Pressable>
                    </View>

                    {/* username & address */}
                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text style={styles.username}>{user && user.name}</Text>
                        <Text style={styles.infoText}>{user && user.address}</Text>
                    </View>

                    {/* user email, phone, bio */}
                    <View style={{ gap: 10 }}>
                        <View style={styles.info}>
                            <Icon
                                name='mail'
                                size={20}
                                color={theme.colors.textLight}
                            />
                            <Text style={styles.infoText}>{user && user.email}</Text>
                        </View>
                    </View>
                    {user && user.phoneNumber && (
                        <View style={{ gap: 10 }}>
                            <View style={styles.info}>
                                <Icon
                                    name='call'
                                    size={20}
                                    color={theme.colors.textLight}
                                />
                                <Text style={styles.infoText}>{user && user.phone_number}</Text>
                            </View>
                        </View>
                    )}
                    {user && user.bio && <Text style={styles.infoText}>{user && user.bio}</Text>}
                </View>
            </View>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        marginHorizontal: wp(4),
        marginBottom: 20,
    },
    headerShape: {
        marginHorizontal: wp(4),
        marginBottom: 20,
    },
    avatarContainer: {
        height: hp(12),
        width: hp(12),
        alignSelf: 'center',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: -12,
        padding: 7,
        borderRadius: 50,
        backgroundColor: '#FFF',
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7,
    },
    username: {
        fontSize: hp(3),
        fontWeight: '500',
        color: theme.colors.textDark,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        fontSize: hp(1.6),
        fontWeight: '500',
        color: theme.colors.textLight,
    },
    logoutButton: {
        position: 'absolute',
        right: 0,
        top: 15,
        padding: 5,
        borderRadius: theme.radius.sm,
        backgroundColor: '#FEE2E2',
    },
    listStyle: {
        paddingHorizontal: wp(4),
        paddingBottom: 30,
    },
    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text,
    },
});
