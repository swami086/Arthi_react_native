import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../api/supabase';
import { Alert } from 'react-native';

export const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
        return null;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
    return null;
};

export const uploadImageToSupabase = async (uri: string, userId: string): Promise<string | null> => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        const filename = `avatars/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filename, blob, {
                contentType: mimeType,
            });

        if (error) {
            console.error('Upload Error:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filename);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Upload Failed', 'There was an error uploading your profile picture.');
        return null;
    }
};
