import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '@/services/NotificationsService';
import { useAuth } from '@/Context-Store/Auth';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import ScreenWrapper from '@/components/Screen_Wrapper';
import { router, useRouter } from 'expo-router';
import NotficationsItemComp from '@/components/NotficationsItem_Comp';
import HeaderComp from '@/components/Header_Comp';

const NotificationsScreen = () => {
    //State Variables
    const [notifications, setNotifications] = useState([]);

    //Hooks
    const { user } = useAuth();
    const router = useRouter();

    //Api call to fetch notifications
    useEffect(() => {
        getNotifications();
    }, []);

    const getNotifications = async () => {
        let resp = await fetchNotifications(user?.id);
        //console.log('notifications fetched: ', resp);
        if (resp.success) setNotifications(resp.data);
    };

    //Component Rendering
    return (
        <ScreenWrapper bg='#FFF'>
            <View style={styles.container}>
                <HeaderComp title='Notifications' />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listStyle}
                >
                    {notifications.map(item => {
                        return (
                            <NotficationsItemComp
                                item={item}
                                key={item.id}
                                router={router}
                            />
                        );
                    })}
                    {notifications.length === 0 && (
                        <Text style={styles.noData}>No notifications found.</Text>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    listStyle: {
        paddingVertical: 20,
        gap: 10,
    },
    noData: {
        fontSize: hp(1.8),
        fontWeight: theme.fonts.medium,
        color: theme.colors.text,
        textAlign: 'center',
    },
});
