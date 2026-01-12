---
id: "3fdf9623-29b8-406a-b79c-ccfa75a88ba4"
title: "Wave 5 Implementation: Frontend Mobile - React Native, Expo SDK 52, GiftedChat & Push Notifications"
assignee: ""
status: 0
createdAt: "1768117264923"
updatedAt: "1768126135441"
type: ticket
---

# Wave 5 Implementation: Frontend Mobile - React Native, Expo SDK 52, GiftedChat & Push Notifications

# Wave 5: Frontend Mobile Implementation

**Duration:** 2 weeks  
**Team Size:** 3-4 developers  
**Prerequisites:** Wave 1-4 complete

## Overview

Implement the mobile app with AI chat using GiftedChat, push notifications for proactive engagement, offline-first architecture, voice input, and biometric authentication using React Native with Expo SDK 52.

## Dependencies

**Must Complete First:**

- All previous waves (1-4)

**Related Specs:**

- `spec:d969320e-d519-47a7-a258-e04789b8ce0e/339a9b00-068b-4a6c-969d-e84e8bba1ff0` - Frontend Mobile Implementation - React Native & Expo

**Related Tickets:**

- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/5673e5ce-540f-461d-80e3-752964809ebf` - [Frontend Mobile] Implement AI Chat Component with GiftedChat
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/0fe59974-48c5-4064-9dbe-60b881563afb` - [Frontend Mobile] Implement Push Notifications for Proactive Agents
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/9d6da56d-f88c-4427-96ff-45133fabe5a4` - [Frontend Mobile] Implement Offline-First Chat with Queue
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/ea8446d7-d415-4739-8816-52ef7ceaa8f9` - [Frontend Mobile] Implement Voice Input for AI Chat
- `ticket:d969320e-d519-47a7-a258-e04789b8ce0e/7ffc20d2-672f-49f8-beee-9d4ff2f5347a` - [Frontend Mobile] Implement Biometric Authentication for Agent Actions

---

## STEP 1: AI Chat Component with GiftedChat

### 1.1 Install Dependencies

```bash
cd mobile
npx expo install react-native-gifted-chat
npx expo install expo-haptics
npx expo install @react-native-async-storage/async-storage
npx expo install expo-av # For voice input
npx expo install expo-local-authentication # For biometric auth
```

### 1.2 Create AI Chat Service

**File:** mobile/src/services/aiChatService.ts

```typescript
import { supabase } from '../api/supabase';
import { reportError, withRollbarTrace } from './rollbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  pending?: boolean;
  sent?: boolean;
  received?: boolean;
}

export class AIChatService {
  private userId: string;
  private intent: string;

  constructor(userId: string, intent: string = 'general_chat') {
    this.userId = userId;
    this.intent = intent;
  }

  async sendMessage(text: string): Promise<ChatMessage> {
    return withRollbarTrace(async () => {
      try {
        // Call agent orchestrator
        const { data, error } = await supabase.functions.invoke('agent-orchestrator', {
          body: {
            message: text,
            userId: this.userId,
            intent: this.intent,
          },
        });

        if (error) throw error;

        // Create response message
        const responseMessage: ChatMessage = {
          _id: data.messageId || Math.random().toString(),
          text: data.response,
          createdAt: new Date(),
          user: {
            _id: 'ai-assistant',
            name: 'AI Assistant',
            avatar: 'https://via.placeholder.com/150',
          },
          sent: true,
          received: true,
        };

        // Store in local cache
        await this.cacheMessage(responseMessage);

        return responseMessage;
      } catch (error) {
        reportError(error, { context: 'ai-chat-service', userId: this.userId });
        throw error;
      }
    }, 'AIChatService.sendMessage');
  }

  async loadCachedMessages(): Promise<ChatMessage[]> {
    try {
      const cached = await AsyncStorage.getItem(`chat_${this.userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      reportError(error, { context: 'load-cached-messages' });
      return [];
    }
  }

  async cacheMessage(message: ChatMessage): Promise<void> {
    try {
      const cached = await this.loadCachedMessages();
      cached.unshift(message);
      
      // Keep only last 100 messages
      const trimmed = cached.slice(0, 100);
      
      await AsyncStorage.setItem(`chat_${this.userId}`, JSON.stringify(trimmed));
    } catch (error) {
      reportError(error, { context: 'cache-message' });
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(`chat_${this.userId}`);
    } catch (error) {
      reportError(error, { context: 'clear-cache' });
    }
  }
}
```

### 1.3 Create AI Chat Screen

**File:** mobile/src/screens/AIChatScreen.tsx

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { useAuth } from '../contexts/AuthContext';
import { AIChatService } from '../services/aiChatService';
import { reportError } from '../services/rollbar';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

export function AIChatScreen({ route }: any) {
  const { user } = useAuth();
  const { intent = 'general_chat' } = route.params || {};
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatService] = useState(() => new AIChatService(user!.id, intent));

  useEffect(() => {
    loadCachedMessages();
  }, []);

  async function loadCachedMessages() {
    try {
      const cached = await chatService.loadCachedMessages();
      setMessages(cached);
    } catch (error) {
      reportError(error, { context: 'load-messages' });
    }
  }

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    
    // Add user message immediately
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    
    // Cache user message
    await chatService.cacheMessage(userMessage as any);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Send to AI
      const response = await chatService.sendMessage(userMessage.text);
      
      // Add AI response
      setMessages((previousMessages) => 
        GiftedChat.append(previousMessages, [response as any])
      );
      
      // Haptic feedback for response
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      reportError(error, { context: 'send-message' });
      
      // Show error message
      const errorMessage: IMessage = {
        _id: Math.random().toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
        user: {
          _id: 'ai-assistant',
          name: 'AI Assistant',
        },
      };
      
      setMessages((previousMessages) => 
        GiftedChat.append(previousMessages, [errorMessage])
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsTyping(false);
    }
  }, [chatService]);

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#007AFF',
          },
          left: {
            backgroundColor: '#E5E5EA',
          },
        }}
        textStyle={{
          right: {
            color: '#FFFFFF',
          },
          left: {
            color: '#000000',
          },
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#007AFF" />
        </View>
      </Send>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: user!.id,
          name: user!.user_metadata?.full_name || 'You',
        }}
        isTyping={isTyping}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        placeholder="Type your message..."
        alwaysShowSend
        scrollToBottom
        showUserAvatar
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    marginRight: 10,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  inputPrimary: {
    alignItems: 'center',
  },
});
```

---

## STEP 2: Push Notifications for Proactive Engagement

### 2.1 Configure Expo Notifications

**File:** mobile/app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#007AFF",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

### 2.2 Create Push Notification Service

**File:** mobile/src/services/pushNotificationService.ts

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../api/supabase';
import { reportError } from './rollbar';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

      // Store token in database
      await supabase
        .from('push_tokens')
        .upsert({
          user_id: this.userId,
          token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
        });
      }

      return token;
    } catch (error) {
      reportError(error, { context: 'register-push-notifications' });
      return null;
    }
  }

  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener for notifications received while app is foregrounded
    const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);

    // Listener for when user taps on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }

  async scheduleLocalNotification(title: string, body: string, data?: any, trigger?: Notifications.NotificationTriggerInput) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null, // null = immediate
      });
    } catch (error) {
      reportError(error, { context: 'schedule-local-notification' });
    }
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }
}
```

### 2.3 Integrate in App

**File:** mobile/App.tsx

```typescript
import { useEffect } from 'react';
import { PushNotificationService } from './src/services/pushNotificationService';
import { useAuth } from './src/contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function App() {
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!user) return;

    const pushService = new PushNotificationService(user.id);

    // Register for push notifications
    pushService.registerForPushNotifications();

    // Setup listeners
    const cleanup = pushService.setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
        // Show in-app notification
      },
      (response) => {
        console.log('Notification tapped:', response);
        
        // Navigate based on notification data
        const { screen, params } = response.notification.request.content.data || {};
        if (screen) {
          navigation.navigate(screen as never, params as never);
        }
      }
    );

    return cleanup;
  }, [user]);

  // ... rest of app
}
```

---

## STEP 3: Offline-First Chat with Queue

### 3.1 Create Offline Queue Service

**File:** mobile/src/services/offlineQueueService.ts

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../api/supabase';
import { reportError, reportInfo } from './rollbar';

interface QueuedMessage {
  id: string;
  text: string;
  userId: string;
  intent: string;
  timestamp: string;
  retryCount: number;
}

export class OfflineQueueService {
  private static QUEUE_KEY = 'offline_message_queue';
  private static MAX_RETRIES = 3;

  static async addToQueue(message: Omit<QueuedMessage, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      
      const queuedMessage: QueuedMessage = {
        ...message,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      queue.push(queuedMessage);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

      reportInfo('Message added to offline queue', { messageId: queuedMessage.id });
    } catch (error) {
      reportError(error, { context: 'add-to-queue' });
    }
  }

  static async getQueue(): Promise<QueuedMessage[]> {
    try {
      const queueJson = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      reportError(error, { context: 'get-queue' });
      return [];
    }
  }

  static async processQueue(): Promise<void> {
    try {
      const queue = await this.getQueue();
      
      if (queue.length === 0) return;

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('No network connection, skipping queue processing');
        return;
      }

      const processedIds: string[] = [];
      const failedMessages: QueuedMessage[] = [];

      for (const message of queue) {
        try {
          // Attempt to send message
          const { error } = await supabase.functions.invoke('agent-orchestrator', {
            body: {
              message: message.text,
              userId: message.userId,
              intent: message.intent,
            },
          });

          if (error) throw error;

          // Success - mark for removal
          processedIds.push(message.id);
          reportInfo('Queued message sent successfully', { messageId: message.id });
        } catch (error) {
          // Increment retry count
          message.retryCount++;

          if (message.retryCount >= this.MAX_RETRIES) {
            // Max retries reached - remove from queue
            processedIds.push(message.id);
            reportError(error, { 
              context: 'process-queue-max-retries', 
              messageId: message.id 
            });
          } else {
            // Keep in queue for retry
            failedMessages.push(message);
          }
        }
      }

      // Update queue - remove processed, keep failed
      const updatedQueue = failedMessages;
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(updatedQueue));

      reportInfo('Queue processing completed', {
        processed: processedIds.length,
        remaining: updatedQueue.length,
      });
    } catch (error) {
      reportError(error, { context: 'process-queue' });
    }
  }

  static async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
    } catch (error) {
      reportError(error, { context: 'clear-queue' });
    }
  }

  static setupAutoProcessing(): () => void {
    // Process queue when network becomes available
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.processQueue();
      }
    });

    // Also process every 30 seconds if connected
    const interval = setInterval(() => {
      this.processQueue();
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }
}
```

### 3.2 Update Chat Service for Offline Support

Update mobile/src/services/aiChatService.ts:

```typescript
import { OfflineQueueService } from './offlineQueueService';
import NetInfo from '@react-native-community/netinfo';

// In sendMessage method:
async sendMessage(text: string): Promise<ChatMessage> {
  return withRollbarTrace(async () => {
    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Add to offline queue
        await OfflineQueueService.addToQueue({
          text,
          userId: this.userId,
          intent: this.intent,
        });

        // Return pending message
        return {
          _id: Math.random().toString(),
          text,
          createdAt: new Date(),
          user: {
            _id: this.userId,
            name: 'You',
          },
          pending: true,
          sent: false,
        };
      }

      // ... rest of existing sendMessage logic
    } catch (error) {
      // ... error handling
    }
  }, 'AIChatService.sendMessage');
}
```

---

## STEP 4: Voice Input with Whisper

### 4.1 Create Voice Input Service

**File:** mobile/src/services/voiceInputService.ts

```typescript
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../api/supabase';
import { reportError } from './rollbar';

export class VoiceInputService {
  private recording: Audio.Recording | null = null;

  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
    } catch (error) {
      reportError(error, { context: 'start-recording' });
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        throw new Error('No active recording');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Transcribe using existing transcribe-audio function
      const audioBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          audio: audioBase64,
          language: 'en', // or 'hi' for Hindi
        },
      });

      if (error) throw error;

      return data.transcript;
    } catch (error) {
      reportError(error, { context: 'stop-recording' });
      return null;
    }
  }

  async cancelRecording(): Promise<void> {
    if (this.recording) {
      await this.recording.stopAndUnloadAsync();
      this.recording = null;
    }
  }

  isRecording(): boolean {
    return this.recording !== null;
  }
}
```

### 3.2 Add Voice Button to Chat

Update mobile/src/screens/AIChatScreen.tsx:

```typescript
import { VoiceInputService } from '../services/voiceInputService';

// Add state
const [isRecording, setIsRecording] = useState(false);
const [voiceService] = useState(() => new VoiceInputService());

// Add voice input handler
const handleVoiceInput = async () => {
  try {
    if (isRecording) {
      // Stop recording and transcribe
      setIsRecording(false);
      const transcript = await voiceService.stopRecording();
      
      if (transcript) {
        // Send transcribed text
        onSend([{
          _id: Math.random().toString(),
          text: transcript,
          createdAt: new Date(),
          user: {
            _id: user!.id,
            name: user!.user_metadata?.full_name || 'You',
          },
        }]);
      }
    } else {
      // Start recording
      await voiceService.startRecording();
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    reportError(error, { context: 'voice-input' });
    setIsRecording(false);
  }
};

// Add voice button to render
const renderActions = () => {
  return (
    <TouchableOpacity
      onPress={handleVoiceInput}
      style={styles.voiceButton}
    >
      <Ionicons
        name={isRecording ? 'stop-circle' : 'mic'}
        size={28}
        color={isRecording ? '#FF3B30' : '#007AFF'}
      />
    </TouchableOpacity>
  );
};

// Add to GiftedChat
<GiftedChat
  // ... existing props
  renderActions={renderActions}
/>
```

---

## STEP 5: Biometric Authentication

### 5.1 Create Biometric Auth Service

**File:** mobile/src/services/biometricAuthService.ts

```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import { reportError } from './rollbar';

export class BiometricAuthService {
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      reportError(error, { context: 'biometric-check-availability' });
      return false;
    }
  }

  static async getSupportedTypes(): Promise<string[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types.map((type) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Touch ID / Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID / Face Recognition';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris Recognition';
          default:
            return 'Biometric';
        }
      });
    } catch (error) {
      reportError(error, { context: 'biometric-get-types' });
      return [];
    }
  }

  static async authenticate(reason: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      reportError(error, { context: 'biometric-authenticate' });
      return false;
    }
  }
}
```

### 5.2 Add Biometric Lock to Sensitive Screens

**File:** mobile/src/screens/ProtectedScreen.tsx

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BiometricAuthService } from '../services/biometricAuthService';

export function ProtectedScreen({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authenticateUser();
  }, []);

  async function authenticateUser() {
    const isAvailable = await BiometricAuthService.isAvailable();
    
    if (!isAvailable) {
      // Biometric not available, allow access
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const success = await BiometricAuthService.authenticate(
      'Authenticate to access sensitive information'
    );

    setIsAuthenticated(success);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Authentication required</Text>
        <TouchableOpacity onPress={authenticateUser} style={styles.button}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
```

---

## STEP 6: Testing & Deployment

### 6.1 Build for Testing

```bash
# iOS
eas build --platform ios --profile preview

# Android
eas build --platform android --profile preview
```

### 6.2 Submit to App Stores

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

---

## SUCCESS CRITERIA

### AI Chat Component

- ✅ GiftedChat displays messages correctly
- ✅ Streams responses from agent orchestrator
- ✅ Haptic feedback on send/receive
- ✅ Cached messages load on app start
- ✅ Smooth scrolling and animations

### Push Notifications

- ✅ Successfully registers for push tokens
- ✅ Receives notifications in foreground/background
- ✅ Tapping notification navigates to correct screen
- ✅ Badge count updates correctly
- ✅ Notification sounds play

### Offline-First Chat

- ✅ Messages queue when offline
- ✅ Auto-processes queue when online
- ✅ Retry logic works correctly
- ✅ User sees pending status
- ✅ No message loss

### Voice Input

- ✅ Records audio successfully
- ✅ Transcribes using Whisper
- ✅ Supports English and Hindi
- ✅ Visual feedback during recording
- ✅ Transcription accuracy > 90%

### Biometric Auth

- ✅ Detects available biometric types
- ✅ Prompts for authentication
- ✅ Falls back to passcode
- ✅ Protects sensitive screens
- ✅ Works on iOS and Android

---

## MONITORING

```typescript
// Track mobile performance
reportInfo('Mobile chat session', {
  platform: Platform.OS,
  messageCount: messages.length,
  offlineQueueSize: await OfflineQueueService.getQueue().length,
  pushTokenRegistered: !!pushToken,
});
```

---

## NEXT WAVE PREVIEW

**Wave 6** will implement:

- API integrations (OpenAI, Anthropic, Daily.co)
- PostHog analytics
- Caching layer for cost optimization
- CI/CD pipeline for automated deployments

**Estimated Duration:** 1.5 weeks

