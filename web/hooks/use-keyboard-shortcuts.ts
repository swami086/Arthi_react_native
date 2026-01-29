'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isMac, shortcuts, type Shortcut } from '@/lib/shortcuts-config';

export interface KeyboardShortcutsOptions {
    onOpenChat?: () => void;
    onShowShortcutsHelp?: () => void;
    onCloseModal?: () => void;
    onOpenCommandPalette?: () => void;
    onToggleRecording?: () => void;
    onSaveSoapNote?: () => void;
    onEditSoapNote?: () => void;
    onApproveSoapNote?: () => void;
    onToggleCopilot?: () => void;
    onActivateBookingAgent?: () => void;
    onActivateInsightsAgent?: () => void;
    onShowChatHelp?: () => void;
    onEditLastMessage?: () => void;
    enabled?: boolean;
}

interface KeyboardShortcutsState {
    shortcutsHelpOpen: boolean;
    setShortcutsHelpOpen: (open: boolean) => void;
    lastSequenceKey: string | null;
}

/**
 * Check if the current focus is in an input element
 */
function isInputFocused(): boolean {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea';
    const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';
    
    return isInput || isContentEditable;
}

/**
 * Check if a keyboard event matches a shortcut
 */
function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
    const key = e.key.toLowerCase();
    const modKey = isMac() ? e.metaKey : e.ctrlKey;
    
    // For sequence shortcuts, we handle them differently
    if (shortcut.isSequence) {
        return false;
    }
    
    const keys = shortcut.keys;
    
    // Check modifier keys
    const needsMod = keys.includes('mod');
    const needsShift = keys.includes('shift');
    const needsAlt = keys.includes('alt');
    
    if (needsMod && !modKey) return false;
    if (!needsMod && modKey) return false;
    if (needsShift && !e.shiftKey) return false;
    if (!needsShift && e.shiftKey && key !== 'shift') return false;
    if (needsAlt && !e.altKey) return false;
    if (!needsAlt && e.altKey) return false;
    
    // Get the actual key (not modifier)
    const actualKeys = keys.filter(k => !['mod', 'shift', 'alt'].includes(k));
    
    if (actualKeys.length === 0) return false;
    
    const targetKey = actualKeys[0].toLowerCase();
    
    // Handle special keys
    if (targetKey === 'escape' && key === 'escape') return true;
    if (targetKey === 'enter' && key === 'enter') return true;
    if (targetKey === 'space' && (key === ' ' || key === 'space')) return true;
    if (targetKey === 'arrowup' && key === 'arrowup') return true;
    if (targetKey === 'arrowdown' && key === 'arrowdown') return true;
    if (targetKey === 'arrowleft' && key === 'arrowleft') return true;
    if (targetKey === 'arrowright' && key === 'arrowright') return true;
    
    // Handle regular keys
    if (targetKey === key) return true;
    if (targetKey === '/' && key === '/') return true;
    
    return false;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}): KeyboardShortcutsState {
    const {
        onOpenChat,
        onShowShortcutsHelp,
        onCloseModal,
        onOpenCommandPalette,
        onToggleRecording,
        onSaveSoapNote,
        onEditSoapNote,
        onApproveSoapNote,
        onToggleCopilot,
        onActivateBookingAgent,
        onActivateInsightsAgent,
        onShowChatHelp,
        onEditLastMessage,
        enabled = true,
    } = options;

    const router = useRouter();
    const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
    const sequenceKeyRef = useRef<string | null>(null);
    const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleShowShortcutsHelp = useCallback(() => {
        if (onShowShortcutsHelp) {
            onShowShortcutsHelp();
        } else {
            setShortcutsHelpOpen(true);
        }
    }, [onShowShortcutsHelp]);

    const handleCloseModal = useCallback(() => {
        if (shortcutsHelpOpen) {
            setShortcutsHelpOpen(false);
            return true;
        }
        if (onCloseModal) {
            onCloseModal();
            return true;
        }
        return false;
    }, [shortcutsHelpOpen, onCloseModal]);

    const executeAction = useCallback((action: string) => {
        switch (action) {
            case 'openChat':
                onOpenChat?.();
                break;
            case 'showShortcutsHelp':
                handleShowShortcutsHelp();
                break;
            case 'closeModal':
                handleCloseModal();
                break;
            case 'openCommandPalette':
                onOpenCommandPalette?.();
                break;
            case 'toggleRecording':
                onToggleRecording?.();
                break;
            case 'saveSoapNote':
                onSaveSoapNote?.();
                break;
            case 'editSoapNote':
                onEditSoapNote?.();
                break;
            case 'approveSoapNote':
                onApproveSoapNote?.();
                break;
            case 'toggleCopilot':
                onToggleCopilot?.();
                break;
            case 'activateBookingAgent':
                onActivateBookingAgent?.();
                break;
            case 'activateInsightsAgent':
                onActivateInsightsAgent?.();
                break;
            case 'showChatHelp':
                onShowChatHelp?.();
                break;
            case 'editLastMessage':
                onEditLastMessage?.();
                break;
            case 'goToDashboard':
                router.push('/home');
                break;
            case 'goToSessions':
                router.push('/appointments');
                break;
            case 'goToPatients':
                router.push('/therapists');
                break;
            case 'goToActivity':
                router.push('/notifications');
                break;
            default:
                break;
        }
    }, [
        onOpenChat,
        handleShowShortcutsHelp,
        handleCloseModal,
        onOpenCommandPalette,
        onToggleRecording,
        onSaveSoapNote,
        onEditSoapNote,
        onApproveSoapNote,
        onToggleCopilot,
        onActivateBookingAgent,
        onActivateInsightsAgent,
        onShowChatHelp,
        onEditLastMessage,
        router,
    ]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        const key = e.key.toLowerCase();
        
        // Handle Escape key - always works
        if (key === 'escape') {
            const handled = handleCloseModal();
            if (handled) {
                e.preventDefault();
            }
            return;
        }

        // Handle sequence shortcuts (g + d, g + s, etc.)
        const sequenceShortcuts = shortcuts.filter(s => s.isSequence);
        
        if (sequenceKeyRef.current === 'g') {
            // We're in a sequence, check for the second key
            for (const shortcut of sequenceShortcuts) {
                if (shortcut.keys[0] === 'g' && shortcut.keys[1] === key) {
                    e.preventDefault();
                    executeAction(shortcut.action);
                    sequenceKeyRef.current = null;
                    if (sequenceTimeoutRef.current) {
                        clearTimeout(sequenceTimeoutRef.current);
                        sequenceTimeoutRef.current = null;
                    }
                    return;
                }
            }
            // Invalid second key, reset sequence
            sequenceKeyRef.current = null;
            if (sequenceTimeoutRef.current) {
                clearTimeout(sequenceTimeoutRef.current);
                sequenceTimeoutRef.current = null;
            }
        }

        // Start a new sequence if 'g' is pressed (not in input)
        if (key === 'g' && !isInputFocused() && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            sequenceKeyRef.current = 'g';
            // Reset sequence after 1 second
            if (sequenceTimeoutRef.current) {
                clearTimeout(sequenceTimeoutRef.current);
            }
            sequenceTimeoutRef.current = setTimeout(() => {
                sequenceKeyRef.current = null;
            }, 1000);
            return;
        }

        // Skip shortcuts when typing in input fields (except for specific shortcuts)
        const inputFocused = isInputFocused();
        
        // Handle non-sequence shortcuts
        for (const shortcut of shortcuts) {
            if (shortcut.isSequence) continue;
            
            // Skip certain shortcuts when in input
            if (inputFocused) {
                // Only allow Escape and modifier-based shortcuts in inputs
                const hasModifier = shortcut.keys.includes('mod') || shortcut.keys.includes('alt');
                if (!hasModifier && shortcut.keys[0] !== 'escape') {
                    continue;
                }
            }

            // Special handling for Space in session context
            if (shortcut.id === 'toggle-recording' && inputFocused) {
                continue;
            }

            if (matchesShortcut(e, shortcut)) {
                e.preventDefault();
                executeAction(shortcut.action);
                return;
            }
        }
    }, [enabled, executeAction, handleCloseModal]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (sequenceTimeoutRef.current) {
                clearTimeout(sequenceTimeoutRef.current);
            }
        };
    }, [enabled, handleKeyDown]);

    return {
        shortcutsHelpOpen,
        setShortcutsHelpOpen,
        lastSequenceKey: sequenceKeyRef.current,
    };
}
