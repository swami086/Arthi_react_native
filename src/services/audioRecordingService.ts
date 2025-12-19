import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

let recording: Audio.Recording | null = null;

export const requestAudioPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Microphone permission is required to record sessions.'
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting audio permissions:', error);
    Alert.alert('Error', 'Failed to request microphone permission');
    return false;
  }
};

export const startRecording = async (): Promise<boolean> => {
  try {
    // Set audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Create new recording instance
    recording = new Audio.Recording();

    // Prepare recording with quality settings
    // Prepare recording with quality settings - Use Preset for better compatibility
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

    // Start recording
    await recording.startAsync();
    return true;
  } catch (error) {
    console.error('Error starting recording:', error);
    Alert.alert('Error', 'Failed to start recording');
    return false;
  }
};

export const pauseRecording = async (): Promise<boolean> => {
  try {
    if (!recording) return false;
    await recording.pauseAsync();
    return true;
  } catch (error) {
    console.error('Error pausing recording:', error);
    return false;
  }
};

export const resumeRecording = async (): Promise<boolean> => {
  try {
    if (!recording) return false;
    await recording.startAsync(); // resumeAsync is deprecated or same as startAsync in some versions, but let's check expo-av docs. Actually startAsync resumes if paused.
    return true;
  } catch (error) {
    console.error('Error resuming recording:', error);
    return false;
  }
};

export const stopRecording = async (): Promise<{ uri: string; duration: number } | null> => {
  try {
    if (!recording) return null;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const status = await recording.getStatusAsync();

    recording = null;

    if (!uri) return null;

    return {
      uri,
      duration: Math.floor((status.durationMillis || 0) / 1000), // Convert to seconds
    };
  } catch (error) {
    console.error('Error stopping recording:', error);
    Alert.alert('Error', 'Failed to stop recording');
    return null;
  }
};

export const getRecordingStatus = async (): Promise<{
  isRecording: boolean;
  durationMillis: number;
  metering: number;
} | null> => {
  try {
    if (!recording) return null;

    const status = await recording.getStatusAsync();
    return {
      isRecording: status.isRecording || false,
      durationMillis: status.durationMillis || 0,
      metering: status.metering || -160, // Metering level for waveform visualization
    };
  } catch (error) {
    console.error('Error getting recording status:', error);
    return null;
  }
};

export const deleteRecording = async (uri: string): Promise<boolean> => {
  try {
    // For local files, use FileSystem
    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
};
