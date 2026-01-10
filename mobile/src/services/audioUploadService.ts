import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../api/supabase';
import { reportError } from './rollbar';


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
    if (fileSizeBytes === 0) {
      console.warn('File size is 0 bytes');
      Alert.alert('Recording Empty', 'No audio was captured. Please check your microphone settings.');
      return null;
    }

    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      Alert.alert(
        'File Too Large',
        `Recording is ${(fileSizeBytes / 1024 / 1024).toFixed(2)}MB. Maximum is ${MAX_FILE_SIZE_MB}MB.`
      );
      return null;
    }

    // 1. First create a DB entry to get the recording ID
    const { data: recording, error: dbError } = await supabase
      .from('session_recordings')
      .insert({
        appointment_id: appointmentId,
        mentor_id: mentorId,
        mentee_id: menteeId,
        consent_captured: true, // Assuming consent was checked in UI
        recording_status: 'processing',
        file_size_bytes: fileSizeBytes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError || !recording) {
      console.error('DB Insert Error', dbError);
      reportError(dbError, 'audioUploadService:uploadAudioToSupabase:dbInsert');
      Alert.alert('Error', 'Failed to initialize recording upload.');
      return null;
    }

    const recordingId = recording.id;
    const fileExt = uri.split('.').pop();
    const fileName = `${mentorId}/${recordingId}.${fileExt}`;

    console.log('[AudioUpload] File info:', { uri, fileExt, fileName, fileSizeBytes });


    // 2. Read file as Base64 and convert to ArrayBuffer (More reliable than fetch blob on RN)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const arrayBuffer = decode(base64);

    // Note: Standard Supabase upload might not support progress in all JS environments easily without XHR
    // For simplicity, we use the standard upload.
    const { data: storageData, error: storageError } = await supabase.storage
      .from('session-recordings')
      .upload(fileName, arrayBuffer, {
        contentType: `audio/${fileExt === 'm4a' ? 'mp4' : 'mpeg'}`,
        upsert: false
      });

    if (storageError) {
      console.error('Storage Upload Error', storageError);
      reportError(storageError, 'audioUploadService:uploadAudioToSupabase:storageUpload');
      Alert.alert('Upload Failed', 'Could not upload audio file.');
      // Cleanup DB entry?
      return null;
    }

    // 3. Update DB with URL and status
    const publicUrl = fileName; // Internal path

    await supabase.from('session_recordings').update({
      recording_url: publicUrl,
      recording_status: 'processing'
    }).eq('id', recordingId);

    if (onProgress) {
      onProgress({
        loaded: fileSizeBytes,
        total: fileSizeBytes,
        percentage: 100
      });
    }

    return {
      recordingId: recordingId,
      recordingUrl: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading audio:', error);
    reportError(error, 'audioUploadService:uploadAudioToSupabase');
    Alert.alert('Upload Error', 'An unexpected error occurred during upload');
    return null;
  }
};
export const deleteRecordingFromStorage = async (
  recordingUrl: string,
  mentorId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('session-recordings')
      .remove([recordingUrl]);

    if (error) {
      console.error('Error deleting from storage:', error);
      reportError(error, 'audioUploadService:deleteRecordingFromStorage');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    reportError(error, 'audioUploadService:deleteRecordingFromStorage');
    return false;
  }
};
