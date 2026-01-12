---
id: "9d6da56d-f88c-4427-96ff-45133fabe5a4"
title: "[Frontend Mobile] Implement Offline-First Chat with Queue"
assignee: ""
status: 0
createdAt: "1768115288782"
updatedAt: "1768123722969"
type: ticket
---

# [Frontend Mobile] Implement Offline-First Chat with Queue

# Implement Offline-First Chat with Queue

## Overview
Implement offline-first chat functionality that queues messages when offline and syncs when back online, ensuring seamless user experience.

## Context
Mobile users often have unreliable connectivity. Offline-first ensures messages are never lost and the chat remains usable even without internet.
  
## Architecture Diagram
  
```mermaid
flowchart TD
    A[User Sends Message] --> B{Network Status}
      
    B -->|Online| C[Send to API]
    C -->|Success| D[Display Sent]
    C -->|Fail| E[Add to Queue]
      
    B -->|Offline| E
    E --> F[Store in AsyncStorage]
    F --> G[Display "Sending..."]
      
    H[Network Reconnect] --> I{Queue Empty?}
    I -->|No| J[Process Queue]
    J --> K[Send Oldest Message]
    K -->|Success| L[Remove from Queue]
    K -->|Fail| M[Retry with Backoff]
    L --> I
    M --> N[Wait 2^n seconds]
    N --> I
      
    I -->|Yes| O[Idle]
      
    P[Background Sync] -->|Every 15 min| I
    Q[App Foreground] --> I
```

## Acceptance Criteria

### 1. Network Detection
- [ ] Use `@react-native-community/netinfo` for connectivity
- [ ] Display online/offline indicator
- [ ] Update UI based on connection status
- [ ] Show "Offline" banner when disconnected

### 2. Message Queue
- [ ] Store unsent messages in AsyncStorage
- [ ] Display "Sending..." indicator for queued messages
- [ ] Retry when back online (exponential backoff)
- [ ] Handle send failures (show error, allow retry)
- [ ] Clear queue on successful send

### 3. Local Storage
- [ ] Store chat history in AsyncStorage
- [ ] Sync with server when online
- [ ] Resolve conflicts (server wins)
- [ ] Limit local storage (last 100 messages)
- [ ] Clear old messages (> 30 days)

### 4. Optimistic Updates
- [ ] Display user message immediately (before send)
- [ ] Show "Sending..." status
- [ ] Update to "Sent" on success
- [ ] Show error icon on failure
- [ ] Allow retry on tap

### 5. Background Sync
- [ ] Use Expo background fetch for sync
- [ ] Sync every 15 minutes (when app in background)
- [ ] Sync on app foreground
- [ ] Sync on network reconnect
- [ ] Track sync success rate

## Technical Details

**Files to Create:**
- `file:mobile/src/features/ai/hooks/useOfflineChat.ts`
- `file:mobile/src/features/ai/services/messageQueue.ts`
- `file:mobile/src/features/ai/services/syncService.ts`

**Implementation:**
```typescript
export function useOfflineChat() {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);

  const sendMessage = async (text: string) => {
    const message = { id: uuid(), text, timestamp: Date.now() };

    if (!isOnline) {
      await queueMessage(message);
      setQueue((prev) => [...prev, message]);
      return;
    }

    try {
      await api.sendMessage(message);
    } catch (error) {
      await queueMessage(message);
      setQueue((prev) => [...prev, message]);
    }
  };

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue();
    }
  }, [isOnline, queue]);

  return { sendMessage, isOnline, queue };
}
```

## Testing
- [ ] Test offline mode (disable network)
- [ ] Test message queue (verify storage)
- [ ] Test sync on reconnect (all messages sent)
- [ ] Test conflict resolution (server wins)
- [ ] Test background sync (app in background)

## Success Metrics
- Message queue success rate 100%
- Sync latency < 5s on reconnect
- Zero message loss
- User satisfaction > 4.5/5

## Dependencies
- NetInfo library
- AsyncStorage
- Background fetch
  
## Related Specifications
  
- spec:d969320e-d519-47a7-a258-e04789b8ce0e/339a9b00-068b-4a6c-969d-e84e8bba1ff0 - Frontend Mobile Implementation
- spec:d969320e-d519-47a7-a258-e04789b8ce0e/719895d0-e8a7-46cc-b5f9-829428065e26 - UX Patterns & Conversational Interface Design

---

## 📋 DETAILED IMPLEMENTATION [WAVE 5]

**Source:** Wave 5 ticket - See STEP 3 for complete offline-first implementation

**File:** `mobile/src/services/offlineQueueService.ts` - Complete OfflineQueueService class with:
- Message queuing when offline
- Auto-processing when online
- Retry logic (max 3 attempts)
- Network state monitoring
- Queue persistence

**Integration:** Updated AIChatService with offline support (see Wave 5 STEP 3.2)

**Features:**
- NetInfo for connectivity detection
- AsyncStorage for queue persistence
- Exponential backoff for retries
- Auto-sync every 30 seconds

**Install:** `npx expo install @react-native-community/netinfo`

**Success:** Queue success 100%, zero message loss

**Wave Progress:** 21/49 updated

