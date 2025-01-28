import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/libs/supabase';

export const getUserImageSource = imagePath => {
    if (imagePath) {
        return getSupabaseFileUrl(imagePath);
    } else {
        return require('../assets/images/defaultUser.png');
    }
};

export const getSupabaseFileUrl = filePath => {
    if (filePath) {
        return {
            uri: `https://nxeudjyuytgxbngrlgci.supabase.co/storage/v1/object/public/uploads/${filePath}`,
        };
    }
    return null;
};

export const downloadFile = async url => {
    try {
        const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
        console.log('image service uri', typeof uri);
        return uri;
    } catch (error) {
        return null;
    }
};

export const getLocalFilePath = filePath => {
    let fileName = filePath.split('/').pop();
    return `${FileSystem.documentDirectory}${fileName}`;
};

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try {
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        let imageData = decode(fileBase64); // decode the image data into array buffer
        let { data, error } = await supabase.storage.from('uploads').upload(fileName, imageData, {
            cacheControl: '3600',
            upsert: false,
            contentType: isImage ? 'image/*' : 'video/*',
        });
        if (error) {
            //console.log('error', error);
            return { success: false, message: 'Uploading file failed' };
        }
        //console.log('data', data);
        return { success: true, message: 'File uploaded successfully', data: data?.path };
    } catch (error) {
        //console.log('error', error);
        return { success: false, message: 'Uploading file failed' };
    }
};

export const getFilePath = (folderName, isImage) => {
    return `/${folderName}/${new Date().getTime()}${isImage ? '.png' : '.mp4'}`;
};
