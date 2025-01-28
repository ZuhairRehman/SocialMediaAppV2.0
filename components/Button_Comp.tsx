import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { theme } from '@/constants/theme';
import { hp } from '@/helpers/common';
import LoadingIndicatorComponent from './LoadingIndicator_Comp';

const ButtonComponent = ({
    buttonStyle,
    textStyle,
    title = '',
    onPress = () => {},
    loading = false,
    hasShadow = true,
}) => {
    {
        /*Shadow Styles*/
    }

    const shadowStyles = {
        shadowColor: theme.colors.dark,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    };

    if (loading) {
        return (
            <View style={[styles.button, buttonStyle, { backgroundColor: '#FFF' }]}>
                <LoadingIndicatorComponent />
            </View>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, buttonStyle, hasShadow && shadowStyles]}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </Pressable>
    );
};

export default ButtonComponent;

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        height: hp(6.6),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.xl,
        borderCurve: 'continuous',
    },
    text: {
        fontSize: hp(2.5),
        color: '#FFF',
        fontWeight: theme.fonts.bold,
    },
});
