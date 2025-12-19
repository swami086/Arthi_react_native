import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const MAX_FILE_SIZE_MB = 25; // Whisper API limit
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadAudioToSupabase = async (
  uri: string,
  appointmentId: string,
  mentorId: string,
  menteeId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ recordingId: string; recordingUrl: string } | null> => {
  try {
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      Alert.alert('Error', 'Recording file not found');
      return null;
    }

    const fileSizeBytes = fileInfo.size || 0;

    // Check file size
    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      Alert.alert(
        'File Too Large',
        `Recording is ${(fileSizeBytes / 1024 / 1024).toFixed(2)}MB. Maximum is ${MAX_FILE_SIZE_MB}MB.`
      );
      return null;
    }

    // PLACEHOLDER: Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        onProgress({
          loaded: (fileSizeBytes * i) / 100,
          total: fileSizeBytes,
          percentage: i,
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // PLACEHOLDER: Return mock recording ID and URL
    // This will be replaced with actual Supabase upload after backend is configured
    const mockRecordingId = `recording_${Date.now()}`;
    const mockRecordingUrl = `file://${uri}`;

    console.log('PLACEHOLDER: Audio upload would be sent to Supabase Storage');
    console.log('Recording ID:', mockRecordingId);
    console.log('File size:', fileSizeBytes, 'bytes');

    Alert.alert('Success', 'Recording saved locally. Backend integration pending.');

    return {
      recordingId: mockRecordingId,
      recordingUrl: mockRecordingUrl,
    };
  } catch (error) {
    console.error('Error uploading audio:', error);
    Alert.alert('Upload Error', 'An unexpected error occurred during upload');
    return null;
  }
};

export const deleteRecordingFromStorage = async (
  recordingUrl: string,
  mentorId: string
): Promise<boolean> => {
  try {
    console.log('PLACEHOLDER: Recording deletion would be sent to Supabase Storage');
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
};
