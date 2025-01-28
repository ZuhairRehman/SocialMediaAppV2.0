import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { hp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import BackButtonComp from './BackButton_Comp';

const HeaderComp = ({ title, showBackBtn = true, mb = 10 }) => {
    //Constants & Variables
    const router = useRouter();

    return (
        <View style={[styles.container, { marginBottom: mb }]}>
            {showBackBtn && (
                <View style={styles.showBackButton}>
                    <BackButtonComp router={router} />
                </View>
            )}
            <Text style={styles.title}>{title || ''}</Text>
        </View>
    );
};

export default HeaderComp;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 10,
    },
    title: {
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semiBold,
        color: theme.colors.textDark,
    },
    showBackButton: {
        position: 'absolute',
        left: 2,
    },
});
