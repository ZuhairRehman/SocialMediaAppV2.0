import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { hp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import { getUserImageSource } from '@/services/ImageService';

const AvatarComp = ({ uri, size = hp(4.5), rounded = theme.radius.md, style = {} }) => {
    return (
        <Image
            source={getUserImageSource(uri)}
            transition={100}
            style={[styles.avatar, { height: size, width: size, borderRadius: rounded }, style]}
        />
    );
};

export default AvatarComp;

const styles = StyleSheet.create({
    avatar: {
        borderCurve: 'continuous',
        borderColor: theme.colors.darkLight,
        borderWidth: 1,
    },
});
