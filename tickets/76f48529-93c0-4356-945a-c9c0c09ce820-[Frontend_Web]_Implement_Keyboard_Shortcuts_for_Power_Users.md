---
id: "76f48529-93c0-4356-945a-c9c0c09ce820"
title: "[Frontend Web] Implement Keyboard Shortcuts for Power Users"
assignee: ""
status: 0
createdAt: "1768115120007"
updatedAt: "1768123664333"
type: ticket
---

# [Frontend Web] Implement Keyboard Shortcuts for Power Users

# Implement Keyboard Shortcuts for Power Users

## Overview
Implement comprehensive keyboard shortcuts for power users, enabling fast navigation and agent interactions without mouse.

## Context
Power users (therapists) benefit from keyboard shortcuts for efficiency. This feature makes the AI more accessible and faster to use.
  
## Architecture Diagram
  
```mermaid
flowchart TD
    A[Key Press] --> B{Parse Shortcut}
      
    B -->|Cmd+K| C[Open Chat]
    B -->|Cmd+/| D[Show Help]
    B -->|Esc| E[Close Modal]
    B -->|@book| F[Activate BookingAgent]
    B -->|G+D| G[Go to Dashboard]
    B -->|Space| H[Start/Stop Recording]
      
    C --> I[Execute Action]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
      
    I --> J[Provide Feedback]
    J -->|Visual| K[Highlight Element]
    J -->|Audio| L[Play Sound]
    J -->|Haptic| M[Vibrate]
      
    I --> N[Log Usage]
    N --> O[Analytics]
```

## Acceptance Criteria

### 1. Global Shortcuts
- [ ] `Cmd+K` (Mac) / `Ctrl+K` (Windows): Open AI chat
- [ ] `Cmd+/`: Show keyboard shortcuts help
- [ ] `Esc`: Close modals/overlays
- [ ] `Cmd+Shift+P`: Open command palette

### 2. Chat Shortcuts
- [ ] `@book`: Activate BookingAgent
- [ ] `@insights`: Activate InsightsAgent
- [ ] `@help`: Show help
- [ ] `Enter`: Send message
- [ ] `Shift+Enter`: New line
- [ ] `Cmd+↑`: Edit last message

### 3. Navigation Shortcuts
- [ ] `G then D`: Go to dashboard
- [ ] `G then S`: Go to sessions
- [ ] `G then P`: Go to patients
- [ ] `G then A`: Go to activity timeline
- [ ] `G then ?`: Show shortcuts help

### 4. Session Shortcuts
- [ ] `Space`: Start/stop recording
- [ ] `Cmd+S`: Save SOAP note
- [ ] `Cmd+E`: Edit SOAP note
- [ ] `Cmd+A`: Approve SOAP note
- [ ] `Cmd+T`: Toggle copilot sidebar

### 5. Shortcuts Help Modal
- [ ] Display all shortcuts (grouped by category)
- [ ] Search shortcuts
- [ ] Customize shortcuts (advanced)
- [ ] Print shortcuts (PDF)

## Technical Details

**Files to Create:**
- `file:web/hooks/use-keyboard-shortcuts.ts`
- `file:web/components/shortcuts-help-modal.tsx`
- `file:web/lib/shortcuts-config.ts`

**Implementation:**
```typescript
import { useEffect } from 'react';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K: Open chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openChat();
      }

      // Cmd+/: Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        showShortcutsHelp();
      }

      // Esc: Close modals
      if (e.key === 'Escape') {
        closeModals();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

## Testing
- [ ] Test all shortcuts (verify actions)
- [ ] Test conflicts (don't override browser shortcuts)
- [ ] Test accessibility (screen reader compatibility)
- [ ] Test on different OS (Mac, Windows, Linux)
- [ ] User testing (power users)

## Success Metrics
- Shortcut usage > 40% (power users)
- Task completion time reduction > 30%
- User satisfaction > 4.5/5
- Zero conflicts with browser shortcuts

## Dependencies
- Embedded chat component
- Navigation system
  
## Related Specifications
  
- spec:d969320e-d519-47a7-a258-e04789b8ce0e/b4c0579d-02d4-44b4-991b-076b73106254 - Frontend Web Implementation
- spec:d969320e-d519-47a7-a258-e04789b8ce0e/719895d0-e8a7-46cc-b5f9-829428065e26 - UX Patterns & Conversational Interface Design

---

## 📋 DETAILED IMPLEMENTATION [WAVE 4]

**Source:** Wave 4 ticket - Keyboard shortcuts for power users

**File:** `web/hooks/use-keyboard-shortcuts.ts` - Global keyboard handler

**Shortcuts:** Cmd+K (chat), Cmd+/ (help), G+D (dashboard), Space (record), Cmd+S (save)

**Deploy:** Included in web deployment

**Success:** Usage > 40%, time reduction > 30%

**Wave Progress:** 18/49 updated

