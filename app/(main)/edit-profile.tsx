import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import ScreenWrapper from '@/components/Screen_Wrapper';
import { hp, wp } from '@/helpers/common';
import { theme } from '@/constants/theme';
import HeaderComp from '@/components/Header_Comp';
import { useAuth } from '@/Context-Store/Auth';
import { getUserImageSource, uploadFile } from '@/services/ImageService';
import Icon from '@/assets/icons';
import InputComp from '@/components/Input_Comp';
import { useEffect, useState } from 'react';
import ButtonComponent from '@/components/Button_Comp';
import { updateUserData } from '@/services/userService';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
    //Constants & Variables
    const { user: currentUser, setUserData } = useAuth();
    const router = useRouter();

    //State Variables
    const [user, setUser] = useState({
        name: '',
        phone_number: '',
        email: '',
        image: null,
        bio: '',
        address: '',
        // other fields
    });

    //loading State
    const [loading, setLoading] = useState(false);

    //Image Source
    let imageSource =
        user.image && typeof user.image == 'object'
            ? user.image.uri
            : getUserImageSource(user.image);

    //Util Functions
    useEffect(() => {
        if (currentUser) {
            setUser({
                name: currentUser.name || '',
                phone_number: currentUser.phone_number || '',
                email: currentUser.email || '',
                image: currentUser.image || null,
                bio: currentUser.bio || '',
                address: currentUser.address || '',
                // other fields
            });
        }
    }, [currentUser]);

    //ImageService
    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });
        if (!result.canceled) {
            setUser({ ...user, image: result.assets[0] });
        }
    };

    //Update all fields
    const onSubmit = async () => {
        let userData = { ...user };
        let { name, phone_number, address, image, bio } = userData;
        if (!name || !phone_number || !address || !bio || !image) {
            Alert.alert('Profile', 'Please fill all fields');
            return;
        }
        setLoading(true);

        // Upload image
        if (typeof image === 'object') {
            let imageRes = await uploadFile('profiles', image.uri, true);
            if (imageRes.success) {
                userData.image = imageRes.data;
            } else {
                userData.image = null;
            }
        }

        //Update user data
        const resp = await updateUserData(currentUser?.id, userData);
        setLoading(false);
        console.log('update user data', resp);
        Alert.alert('Profile', 'Profile updated successfully');

        // navigate to profile screen

        if (resp.success) {
            setUserData({ ...currentUser, ...userData });
            router.back();
        }
    };

    return (
        <ScreenWrapper bg='#FFF'>
            <View style={styles.container}>
                <ScrollView style={{ flex: 1 }}>
                    <HeaderComp title='Edit Profile' />

                    {/*  Form  */}
                    <View style={styles.form}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={imageSource}
                                style={styles.avatar}
                            />
                            <Pressable
                                style={styles.cameraIcon}
                                onPress={onPickImage}
                            >
                                <Icon
                                    name='camera'
                                    size={20}
                                    strokeWidth={2.5}
                                />
                            </Pressable>
                        </View>
                        <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
                            Please fill your profile details
                        </Text>
                        <InputComp // custom input_comp
                            icon={<Icon name='user' />}
                            placeholder='enter your name'
                            value={user.name}
                            onChangeText={value => {
                                setUser({ ...user, name: value });
                            }}
                        />
                        <InputComp // custom input_comp
                            icon={<Icon name='call' />}
                            placeholder='enter your number'
                            value={user.phone_number}
                            onChangeText={value => {
                                setUser({ ...user, phone_number: value });
                            }}
                        />
                        <InputComp // custom input_comp
                            icon={<Icon name='location' />}
                            placeholder='enter your address'
                            value={user.address}
                            onChangeText={value => {
                                setUser({ ...user, address: value });
                            }}
                        />
                        <InputComp // custom input_comp
                            placeholder='enter your bio'
                            value={user.bio}
                            onChangeText={value => {
                                setUser({ ...user, bio: value });
                            }}
                            multiline={true}
                            containerStyle={styles.bio}
                        />
                        <ButtonComponent
                            title='Update'
                            loading={loading}
                            onPress={onSubmit}
                        />
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
    },
    avatarContainer: {
        height: hp(14),
        width: hp(14),
        alignSelf: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: theme.radius.xxl * 1.8,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: theme.colors.darkLight,
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        backgroundColor: '#FFF',
        borderRadius: 50,
        padding: 8,
        shadowColor: theme.colors.textLight,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 7,
    },
    form: {
        gap: 18,
        marginTop: 20,
    },
    input: {
        flexDirection: 'row',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        borderCurve: 'continuous',
        padding: 17,
        paddingHorizontal: 20,
        gap: 15,
    },
    bio: {
        flexDirection: 'row',
        height: hp(15),
        alignItems: 'flex-start',
        paddingVertical: 15,
    },
});
