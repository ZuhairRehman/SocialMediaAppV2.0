import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { theme } from '@/constants/theme';
import { hp } from '@/helpers/common';
import AvatarComp from './Avatar_Comp';
import moment from 'moment';

const NotficationsItemComp = ({ item, router }) => {
    //Constants & Variables
    const createdAt = moment(item?.created_at).format('MMM d'); // moment library

    //Util functions
    const handleClick = () => {
        //render post details on notifications screen
        let { postId, commentId } = JSON.parse(item?.data);
        router.push({ pathname: 'post-details', params: { postId, commentId } });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handleClick}
        >
            <AvatarComp
                uri={item?.sender?.image}
                size={hp(5)}
            />
            <View style={styles.nameTitle}>
                <Text style={styles.text}>{item?.sender?.name}</Text>
                <Text style={[styles.text, { color: theme.colors.textDark }]}>{item?.title}</Text>
            </View>
            <Text style={[styles.text, { color: theme.colors.textLight }]}>{createdAt}</Text>
        </TouchableOpacity>
    );
};

export default NotficationsItemComp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: theme.colors.darkLight,
        padding: 15,
        borderRadius: theme.radius.xxl,
        borderCurve: 'continuous',
    },
    nameTitle: {
        flex: 1,
        gap: 2,
    },
    text: {
        fontSize: hp(1.6),
        fontWeight: theme.fonts.medium,
        color: theme.colors.text,
    },
});
