import { StyleSheet, Text, View, TextInput, Pressable, Alert } from 'react-native';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import ScreenWrapper from '@/components/Screen_Wrapper';
import { StatusBar } from 'expo-status-bar';
import BackButtonComp from '@/components/BackButton_Comp';
import { useRouter } from 'expo-router';
import InputComp from '@/components/Input_Comp';
import Icon from '@/assets/icons';
import { useRef, useState } from 'react';
import ButtonComponent from '@/components/Button_Comp';
import { supabase } from '@/libs/supabase';

const SignupScreen = () => {
    
        // Constants & VAriables/

    const router = useRouter();
    const emailRef = useRef('');
    const nameRef = useRef('');
    const passwordRef = useRef('');
    const [loading, setLoading] = useState(false);

    //* Utils or event listeners */
    

    async function onSubmit() {
        if (!emailRef.current || !passwordRef.current || !nameRef.current) {
            Alert.alert('Please fill in all the details');
            return;
        }
        //trim input fields for blank spaces
        let name = nameRef.current.trim();
        let password = passwordRef.current.trim();
        let email = emailRef.current.trim();

        setLoading(true);

        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({           //SUPABASE SING UP and data push to server
            email,
            password,
            options: {
                data: {
                    name,
                },
            },
        });
        setLoading(false);

        // console.log('session: ', session);
        // console.log(error);
        if (error) {
            Alert.alert('Error signing up', error.message);
            return;
        }
    }

    return (
        <ScreenWrapper bg='#FFF'>
            <StatusBar
                style='dark'
                backgroundColor='#FFF'
            />
            <View style={styles.container}>
                <BackButtonComp router={router} />

                {/* Welcome Text */}

                <View>
                    <Text style={styles.welcomeText}>Let's,</Text>
                    <Text style={styles.welcomeText}>Get Started!</Text>
                </View>

                {/* Login Form */}
                <View style={styles.form}>
                    <Text
                        style={{
                            fontSize: hp(1.5),
                            color: theme.colors.text,
                        }}
                    >
                        Sign up with an email address & password
                    </Text>
                    <InputComp //Custom Input_Comp
                        icon={
                            <Icon
                                name='user'
                                size={26}
                                strokeWidth={1.6}
                            />
                        }
                        placeholder='Enter a username'
                        onChangeText={value => (nameRef.current = value)}
                    />
                    <InputComp //Custom Input_Comp
                        icon={
                            <Icon
                                name='mail'
                                size={26}
                                strokeWidth={1.6}
                            />
                        }
                        placeholder='Enter your email address'
                        onChangeText={value => (emailRef.current = value)}
                    />
                    <InputComp //Custom Input_Comp
                        icon={
                            <Icon
                                name='lock'
                                size={26}
                                strokeWidth={1.6}
                            />
                        }
                        placeholder='Enter your password'
                        onChangeText={value => (passwordRef.current = value)}
                        secureTextEntry={true}
                    />
                    <Text style={styles.forgotPassword}>Forgot password?</Text>

                    {/* Login Button */}
                    <ButtonComponent //Custom Button_Comp
                        title='Sign up'
                        loading={loading}
                        onPress={onSubmit}
                    />
                </View>
                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <Pressable onPress={() => router.push('/login')}>
                        <Text
                            style={[
                                styles.footerText,
                                {
                                    color: theme.colors.primaryDark,
                                    fontWeight: theme.fonts.semiBold,
                                },
                            ]}
                        >
                            Login
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
        backgroundColor: '#FFF',
    },
    welcomeText: {
        fontSize: wp(8),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    form: {
        gap: 25,
    },
    forgotPassword: {
        textAlign: 'right',
        color: theme.colors.text,
        fontWeight: theme.fonts.semiBold,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
    },
});
