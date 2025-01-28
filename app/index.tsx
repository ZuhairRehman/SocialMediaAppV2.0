import LoadingIndicatorComponent from '@/components/LoadingIndicator_Comp';
import { useRouter } from 'expo-router';
import { Text, View, Button } from 'react-native';

export default function Index() {
    
        //Constants & Variables
        const router = useRouter();

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LoadingIndicatorComponent />
        </View>
    );
}
