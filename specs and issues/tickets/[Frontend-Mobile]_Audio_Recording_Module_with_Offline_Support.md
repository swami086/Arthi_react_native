# [Frontend-Mobile] Audio Recording Module with Offline Support

## Overview
Implement the mobile audio recording module with offline support, allowing therapists to record sessions even without internet connectivity and sync later.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/40e954fc-4f47-4a50-89ff-6064819e3165` (Frontend Mobile Implementation - Recording Section)

Mobile recording is critical for therapists who conduct sessions in locations with poor connectivity. Offline support ensures no data loss.

## Recording Screen

```wireframe
┌─────────────────────────┐
│  ← Back      Session    │
│                         │
│  Rahul Sharma           │
│  Individual Therapy     │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │       🎙️         │  │
│  │                   │  │
│  │    00:45:23       │  │
│  │                   │  │
│  │   Recording...    │  │
│  │                   │  │
│  │  ┌─────────────┐ │  │
│  │  │ ⏸️  Pause   │ │  │
│  │  └─────────────┘ │  │
│  │                   │  │
│  │  ┌─────────────┐ │  │
│  │  │ ⏹️  Stop    │ │  │
│  │  └─────────────┘ │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  📝 Quick Notes         │
│  ┌───────────────────┐  │
│  │ Patient mentioned │  │
│  │ work stress...    │  │
│  └───────────────────┘  │
│                         │
│  🔴 Recording locally   │
│  Will sync when online  │
└─────────────────────────┘
```

## Technical Requirements

### 1. Audio Recording with Expo AV
```typescript
// lib/hooks/useAudioRecording.ts
import { Audio } from 'expo-av';
import { useState, useRef } from 'react';
import * as FileSystem from 'expo-file-system';

export function useAudioRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      
      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };
  
  const pauseRecording = async () => {
    if (!recordingRef.current) return;
    await recordingRef.current.pauseAsync();
    setIsPaused(true);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };
  
  const resumeRecording = async () => {
    if (!recordingRef.current) return;
    await recordingRef.current.startAsync();
    setIsPaused(false);
    durationIntervalRef.current = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  };
  
  const stopRecording = async () => {
    if (!recordingRef.current) return;
    
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  };
  
  return {
    isRecording,
    isPaused,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording
  };
}
```

### 2. Offline Storage with SQLite
```typescript
// lib/database/offline.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('therapyflow.db');

export function initOfflineDatabase() {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS offline_recordings (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        file_uri TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        file_size_bytes INTEGER NOT NULL,
        recorded_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
    
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS offline_notes (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        content TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );
  });
}

export function saveOfflineRecording(recording: OfflineRecording) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO offline_recordings 
        (id, session_id, patient_id, file_uri, duration_seconds, file_size_bytes, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          recording.id,
          recording.sessionId,
          recording.patientId,
          recording.fileUri,
          recording.durationSeconds,
          recording.fileSizeBytes,
          recording.recordedAt
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}

export function getUnsyncedRecordings(): Promise<OfflineRecording[]> {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM offline_recordings WHERE synced = 0',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
}

export function markRecordingAsSynced(id: string) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE offline_recordings SET synced = 1 WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}
```

### 3. Background Sync Service
```typescript
// lib/services/syncService.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import NetInfo from '@react-native-community/netinfo';

const SYNC_TASK = 'background-sync';

TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    const netInfo = await NetInfo.fetch();
    
    if (!netInfo.isConnected) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    // Get unsynced recordings
    const recordings = await getUnsyncedRecordings();
    
    for (const recording of recordings) {
      await syncRecording(recording);
    }
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
    minimumInterval: 15 * 60, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

async function syncRecording(recording: OfflineRecording) {
  // Read file
  const fileInfo = await FileSystem.getInfoAsync(recording.fileUri);
  if (!fileInfo.exists) {
    throw new Error('Recording file not found');
  }
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('session-recordings')
    .upload(
      `${recording.sessionId}_${Date.now()}.m4a`,
      {
        uri: recording.fileUri,
        type: 'audio/m4a',
        name: `recording.m4a`
      }
    );
  
  if (error) throw error;
  
  // Save metadata to database
  await supabase
    .from('session_recordings')
    .insert({
      session_id: recording.sessionId,
      file_path: data.path,
      duration_seconds: recording.durationSeconds,
      file_size_bytes: recording.fileSizeBytes
    });
  
  // Mark as synced
  await markRecordingAsSynced(recording.id);
  
  // Delete local file
  await FileSystem.deleteAsync(recording.fileUri);
}
```

### 4. Recording Screen Component
```typescript
// app/record/[sessionId].tsx
import { useLocalSearchParams } from 'expo-router';
import { useAudioRecording } from '@/lib/hooks/useAudioRecording';
import { saveOfflineRecording } from '@/lib/database/offline';
import NetInfo from '@react-native-community/netinfo';

export default function RecordingScreen() {
  const { sessionId, patientId } = useLocalSearchParams();
  const {
    isRecording,
    isPaused,
    duration,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording
  } = useAudioRecording();
  
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleStop = async () => {
    const uri = await stopRecording();
    
    if (!uri) return;
    
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    const recording = {
      id: uuid(),
      sessionId,
      patientId,
      fileUri: uri,
      durationSeconds: duration,
      fileSizeBytes: fileInfo.size,
      recordedAt: new Date().toISOString()
    };
    
    if (isOnline) {
      // Upload immediately
      await syncRecording(recording);
    } else {
      // Save for later sync
      await saveOfflineRecording(recording);
      Alert.alert(
        'Saved Offline',
        'Recording will sync when you\'re back online'
      );
    }
    
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.recordingIndicator}>
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
        <Text style={styles.status}>
          {isRecording ? 'Recording...' : 'Paused'}
        </Text>
      </View>
      
      <View style={styles.controls}>
        {isRecording && !isPaused && (
          <TouchableOpacity onPress={pauseRecording}>
            <Text>⏸️ Pause</Text>
          </TouchableOpacity>
        )}
        
        {isPaused && (
          <TouchableOpacity onPress={resumeRecording}>
            <Text>▶️ Resume</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handleStop}>
          <Text>⏹️ Stop</Text>
        </TouchableOpacity>
      </View>
      
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text>🔴 Recording locally - Will sync when online</Text>
        </View>
      )}
    </View>
  );
}
```

## Acceptance Criteria
- [ ] Audio recording working with high quality
- [ ] Pause/resume functionality working
- [ ] Duration timer accurate
- [ ] Offline storage with SQLite implemented
- [ ] Background sync service registered
- [ ] Automatic sync when online
- [ ] Manual sync trigger available
- [ ] Network status indicator
- [ ] Recording saved locally when offline
- [ ] Sync progress indicator
- [ ] Error handling for recording failures
- [ ] Microphone permission handling
- [ ] Background recording support (iOS)
- [ ] File cleanup after successful sync
- [ ] Sync retry logic for failures

## Dependencies
- Requires: React Native Mobile App Setup
- Requires: Authentication Flow Implementation
- Requires: Database Schema Implementation

## Estimated Effort
12-14 hours