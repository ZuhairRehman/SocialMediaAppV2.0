import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from '@/components/Screen_Wrapper';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import ButtonComponent from '@/components/Button_Comp';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
    
        //*Constants & Variables */
    
    const router = useRouter();

    return (
        <ScreenWrapper bg='#FFF'>
            <View style={styles.container}>
                {/* Welcome Iamge */}
                <Image
                    source={require('../assets/images/welcome.png')}
                    style={styles.welcomeImage}
                    resizeMode='contain'
                />
                {/*Welcome Title*/}
                <View style={{ gap: 20 }}>
                    <Text style={styles.title}>LinkUp!</Text>
                    <Text style={styles.punchline}>
                        Where every thought finds a home and every image tells a story
                    </Text>
                </View>
                {/* Sign Up Button */}
                <View style={styles.footer}>
                    <ButtonComponent
                        title='Getting Started'
                        buttonStyle={{ marginHorizontal: wp(3) }}
                        onPress={() => router.push('/sign-up')}
                    />
                    <View style={styles.bottomTextContainer}>
                        <Text style={styles.loginText}>Already have an account?</Text>
                        <Pressable onPress={() => router.push('/login')}>
                            <Text
                                style={[
                                    styles.loginText,
                                    {
                                        color: theme.colors.primary,
                                        fontWeight: theme.fonts.semiBold,
                                    },
                                ]}
                            >
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
            <StatusBar style='dark' />
        </ScreenWrapper>
    );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        backgroundColor: '#FFF',
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        textAlign: 'center',
    },
    welcomeImage: {
        width: wp(100),
        height: hp(30),
        alignSelf: 'center',
    },
    punchline: {
        textAlign: 'center',
        fontSize: hp(1.7),
        paddingHorizontal: wp(10),
        color: theme.colors.text,
    },
    footer: {
        gap: 30,
        width: '100%',
    },
    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
    },
});
