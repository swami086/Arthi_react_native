/**
 * Keyboard Shortcuts Configuration
 * Defines all keyboard shortcuts for power users
 */

export type ShortcutCategory = 'global' | 'chat' | 'navigation' | 'session';

export interface Shortcut {
    id: string;
    keys: string[];
    description: string;
    category: ShortcutCategory;
    action: string;
    isSequence?: boolean;
}

export interface ShortcutGroup {
    category: ShortcutCategory;
    label: string;
    shortcuts: Shortcut[];
}

/**
 * Detects if the user is on macOS
 */
export function isMac(): boolean {
    if (typeof window === 'undefined') return false;
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Returns the modifier key label based on OS
 */
export function getModifierKey(): string {
    return isMac() ? 'Cmd' : 'Ctrl';
}

/**
 * Format shortcut keys for display
 */
export function formatShortcutKeys(keys: string[], isSequence?: boolean): string {
    const modKey = getModifierKey();
    const formattedKeys = keys.map(key => {
        if (key === 'mod') return modKey;
        if (key === 'shift') return 'Shift';
        if (key === 'alt') return 'Alt';
        if (key === 'enter') return 'Enter';
        if (key === 'escape') return 'Esc';
        if (key === 'space') return 'Space';
        if (key === 'arrowup') return '\u2191';
        if (key === 'arrowdown') return '\u2193';
        if (key === 'arrowleft') return '\u2190';
        if (key === 'arrowright') return '\u2192';
        return key.toUpperCase();
    });
    
    return isSequence ? formattedKeys.join(' then ') : formattedKeys.join('+');
}

/**
 * All keyboard shortcuts configuration
 */
export const shortcuts: Shortcut[] = [
    // Global Shortcuts
    {
        id: 'open-chat',
        keys: ['mod', 'k'],
        description: 'Open AI chat',
        category: 'global',
        action: 'openChat',
    },
    {
        id: 'show-shortcuts',
        keys: ['mod', '/'],
        description: 'Show keyboard shortcuts help',
        category: 'global',
        action: 'showShortcutsHelp',
    },
    {
        id: 'close-modal',
        keys: ['escape'],
        description: 'Close modals/overlays',
        category: 'global',
        action: 'closeModal',
    },
    {
        id: 'command-palette',
        keys: ['mod', 'shift', 'p'],
        description: 'Open command palette',
        category: 'global',
        action: 'openCommandPalette',
    },

    // Chat Shortcuts
    {
        id: 'activate-booking-agent',
        keys: ['@', 'book'],
        description: 'Activate BookingAgent',
        category: 'chat',
        action: 'activateBookingAgent',
    },
    {
        id: 'activate-insights-agent',
        keys: ['@', 'insights'],
        description: 'Activate InsightsAgent',
        category: 'chat',
        action: 'activateInsightsAgent',
    },
    {
        id: 'show-chat-help',
        keys: ['@', 'help'],
        description: 'Show help',
        category: 'chat',
        action: 'showChatHelp',
    },
    {
        id: 'send-message',
        keys: ['enter'],
        description: 'Send message',
        category: 'chat',
        action: 'sendMessage',
    },
    {
        id: 'new-line',
        keys: ['shift', 'enter'],
        description: 'New line',
        category: 'chat',
        action: 'newLine',
    },
    {
        id: 'edit-last-message',
        keys: ['mod', 'arrowup'],
        description: 'Edit last message',
        category: 'chat',
        action: 'editLastMessage',
    },

    // Navigation Shortcuts (sequences)
    {
        id: 'go-to-dashboard',
        keys: ['g', 'd'],
        description: 'Go to dashboard',
        category: 'navigation',
        action: 'goToDashboard',
        isSequence: true,
    },
    {
        id: 'go-to-sessions',
        keys: ['g', 's'],
        description: 'Go to sessions',
        category: 'navigation',
        action: 'goToSessions',
        isSequence: true,
    },
    {
        id: 'go-to-patients',
        keys: ['g', 'p'],
        description: 'Go to patients',
        category: 'navigation',
        action: 'goToPatients',
        isSequence: true,
    },
    {
        id: 'go-to-activity',
        keys: ['g', 'a'],
        description: 'Go to activity timeline',
        category: 'navigation',
        action: 'goToActivity',
        isSequence: true,
    },
    {
        id: 'show-nav-shortcuts',
        keys: ['g', '?'],
        description: 'Show shortcuts help',
        category: 'navigation',
        action: 'showShortcutsHelp',
        isSequence: true,
    },

    // Session Shortcuts
    {
        id: 'toggle-recording',
        keys: ['space'],
        description: 'Start/stop recording',
        category: 'session',
        action: 'toggleRecording',
    },
    {
        id: 'save-soap-note',
        keys: ['mod', 's'],
        description: 'Save SOAP note',
        category: 'session',
        action: 'saveSoapNote',
    },
    {
        id: 'edit-soap-note',
        keys: ['mod', 'e'],
        description: 'Edit SOAP note',
        category: 'session',
        action: 'editSoapNote',
    },
    {
        id: 'approve-soap-note',
        keys: ['mod', 'a'],
        description: 'Approve SOAP note',
        category: 'session',
        action: 'approveSoapNote',
    },
    {
        id: 'toggle-copilot',
        keys: ['mod', 't'],
        description: 'Toggle copilot sidebar',
        category: 'session',
        action: 'toggleCopilot',
    },
];

/**
 * Get shortcuts grouped by category
 */
export function getShortcutGroups(): ShortcutGroup[] {
    const categoryLabels: Record<ShortcutCategory, string> = {
        global: 'Global',
        chat: 'Chat',
        navigation: 'Navigation',
        session: 'Session',
    };

    const categories: ShortcutCategory[] = ['global', 'chat', 'navigation', 'session'];
    
    return categories.map(category => ({
        category,
        label: categoryLabels[category],
        shortcuts: shortcuts.filter(s => s.category === category),
    }));
}

/**
 * Search shortcuts by description or keys
 */
export function searchShortcuts(query: string): Shortcut[] {
    const lowerQuery = query.toLowerCase();
    return shortcuts.filter(shortcut => {
        const descMatch = shortcut.description.toLowerCase().includes(lowerQuery);
        const keysMatch = shortcut.keys.some(key => key.toLowerCase().includes(lowerQuery));
        const actionMatch = shortcut.action.toLowerCase().includes(lowerQuery);
        return descMatch || keysMatch || actionMatch;
    });
}
