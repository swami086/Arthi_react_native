# [BioSync] Apple HealthKit Integration (iOS)

## Overview
Implement Apple HealthKit integration for iOS devices to sync wearable data from Apple Watch and other compatible devices.

## Context
Reference: `spec:df06a57d-bbce-4623-8e1c-cd129f15f2cf/6bd132cb-1ab4-4b86-a1d0-dfb2c8f5ef62` (BioSync Wearable Integration - iOS Section)

Apple HealthKit provides comprehensive health data access on iOS, essential for therapists using iPhones and patients with Apple Watches.

## Technical Requirements

### 1. Install HealthKit Package
```bash
npx expo install expo-health-connect
```

### 2. Configure iOS Permissions
```xml
<!-- ios/TherapyFlow/Info.plist -->
<key>NSHealthShareUsageDescription</key>
<string>TherapyFlow needs access to your health data to provide insights for your therapy sessions</string>
<key>NSHealthUpdateUsageDescription</key>
<string>TherapyFlow needs to update your health data</string>

<key>UIBackgroundModes</key>
<array>
  <string>processing</string>
</array>
```

### 3. Enable HealthKit Capability
Add HealthKit capability in Xcode:
- Open `ios/TherapyFlow.xcworkspace`
- Select target → Signing & Capabilities
- Add HealthKit capability

### 4. HealthKit Client Setup
```typescript
// lib/health/appleHealthKit.ts
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
    ],
    write: [],
  },
};

export async function initializeHealthKit(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error('HealthKit initialization failed:', error);
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}
```

### 5. Data Sync Functions
```typescript
export async function syncHeartRateData(patientId: string, days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return new Promise((resolve, reject) => {
    AppleHealthKit.getHeartRateSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      async (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        const dataPoints = results.map(sample => ({
          patient_id: patientId,
          data_type: 'heart_rate',
          metrics: {
            bpm: sample.value,
            source: sample.sourceName,
          },
          recorded_at: sample.startDate,
          source: 'apple_healthkit'
        }));
        
        await supabase.from('wearable_data').insert(dataPoints);
        resolve(dataPoints.length);
      }
    );
  });
}

export async function syncHRVData(patientId: string, days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return new Promise((resolve, reject) => {
    AppleHealthKit.getHeartRateVariabilitySamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      async (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        const dataPoints = results.map(sample => ({
          patient_id: patientId,
          data_type: 'hrv',
          metrics: {
            rmssd: sample.value,
          },
          recorded_at: sample.startDate,
          source: 'apple_healthkit'
        }));
        
        await supabase.from('wearable_data').insert(dataPoints);
        resolve(dataPoints.length);
      }
    );
  });
}

export async function syncSleepData(patientId: string, days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      async (err: Object, results: any[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Group by sleep session
        const sessions = groupSleepSessions(results);
        
        const dataPoints = sessions.map(session => ({
          patient_id: patientId,
          data_type: 'sleep',
          metrics: {
            duration_hours: session.durationHours,
            start_time: session.startDate,
            end_time: session.endDate,
            stages: session.stages,
            quality: session.quality,
          },
          recorded_at: session.startDate,
          source: 'apple_healthkit'
        }));
        
        await supabase.from('wearable_data').insert(dataPoints);
        resolve(dataPoints.length);
      }
    );
  });
}

export async function syncStepsData(patientId: string, days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return new Promise((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      async (err: Object, results: HealthValue[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        const dataPoints = results.map(sample => ({
          patient_id: patientId,
          data_type: 'steps',
          metrics: {
            count: sample.value,
          },
          recorded_at: sample.startDate,
          source: 'apple_healthkit'
        }));
        
        await supabase.from('wearable_data').insert(dataPoints);
        resolve(dataPoints.length);
      }
    );
  });
}
```

### 6. Background Sync with Background Tasks
```typescript
// lib/health/backgroundSync.ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const HEALTHKIT_SYNC_TASK = 'healthkit-background-sync';

TaskManager.defineTask(HEALTHKIT_SYNC_TASK, async () => {
  try {
    const { user } = await getCurrentUser();
    if (!user?.patientId) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    await syncAllHealthData(user.patientId);
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background HealthKit sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerHealthKitBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(HEALTHKIT_SYNC_TASK, {
    minimumInterval: 60 * 60, // 1 hour
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
```

### 7. Unified Sync Interface
```typescript
// lib/health/index.ts
import { Platform } from 'react-native';
import * as GoogleHealthConnect from './googleHealthConnect';
import * as AppleHealthKit from './appleHealthKit';

export async function initializeHealthPlatform() {
  if (Platform.OS === 'ios') {
    return await AppleHealthKit.initializeHealthKit();
  } else if (Platform.OS === 'android') {
    return await GoogleHealthConnect.initializeHealthConnect();
  }
  throw new Error('Unsupported platform');
}

export async function syncAllHealthData(patientId: string) {
  if (Platform.OS === 'ios') {
    return await AppleHealthKit.syncAllHealthData(patientId);
  } else if (Platform.OS === 'android') {
    return await GoogleHealthConnect.syncAllHealthData(patientId);
  }
  throw new Error('Unsupported platform');
}

export async function requestHealthPermissions() {
  if (Platform.OS === 'ios') {
    return await AppleHealthKit.initializeHealthKit();
  } else if (Platform.OS === 'android') {
    return await GoogleHealthConnect.requestHealthPermissions();
  }
  throw new Error('Unsupported platform');
}
```

## Acceptance Criteria
- [ ] Apple HealthKit initialized successfully
- [ ] Permission request flow working
- [ ] Heart rate data syncing correctly
- [ ] HRV data syncing correctly
- [ ] Sleep data syncing correctly
- [ ] Steps data syncing correctly
- [ ] Activity data syncing correctly
- [ ] Data uploaded to Supabase correctly
- [ ] Background sync working
- [ ] Unified interface for iOS and Android
- [ ] Settings screen working on iOS
- [ ] Manual sync working
- [ ] Auto sync scheduled
- [ ] Error handling for sync failures
- [ ] Tested with Apple Watch

## Dependencies
- Requires: React Native Mobile App Setup
- Requires: Database Schema Implementation
- Requires: BioSync Agent Implementation
- Requires: Google Health Connect Integration (for unified interface)

## Estimated Effort
10-12 hours