import { supabase } from '@/libs/supabase';

export const getUserData = async userId => {
    try {
        const { data, error } = await supabase.from('users').select().eq('id', userId).single();
        return { success: true, data };
    } catch (error) {
        console.log('error', error);
        return { success: false, errorMessage: error.message };
    }
};
 
export const updateUserData = async (userId, data) => {
    try {
        const { error } = await supabase.from('users').update(data).eq('id', userId);
        return { success: true, data };
    } catch (error) {
        console.log('error', error);
        return { success: false, errorMessage: error.message };
    }
};
