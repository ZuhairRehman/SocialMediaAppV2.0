import { AuthProvider, useAuth } from '@/Context-Store/Auth';
import { supabase } from '@/libs/supabase';
import { getUserData } from '@/services/userService';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
    'Warning: TNodeChildrenRenderer',
    'Warning: MemoizedTNodeRenderer',
    'Warning: TRenderEngineProvider',
]);

const _layout = () => {
    return (
        <AuthProvider>
            <MainLayout />
        </AuthProvider>
    );
};

export function MainLayout() {
    const router = useRouter(); //Router for redirects

    const { setAuth, setUserData } = useAuth(); //Auth provider

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
            //console.log('user session: ',  session?.user);

            if (session) {
                //Set the session
                setAuth(session);

                //update user data
                updateUserData(session?.user, session?.user?.email);

                //User is authenticated, move to Home screen
                router.replace('/home');
            } else {
                //Set session state to null
                setAuth(null);

                //User is not authenticated, move to Welcome screen
                router.replace('/welcome');
            }
        });
    }, []);

    //Util function to fetch all the fields in DB table

    const updateUserData = async (user, email) => {
        let resp = await getUserData(user?.id);
        //console.log('got user data', resp);
        if (resp.success) setUserData({ ...resp.data, email });
    };

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name='(main)/post-details'
                options={{
                    presentation: 'modal',
                    animationTypeForReplace: 'push',
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack>
    );
}

export default _layout;
