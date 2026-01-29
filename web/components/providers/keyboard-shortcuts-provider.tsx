'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { ShortcutsHelpModal } from '@/components/shortcuts-help-modal';

interface KeyboardShortcutsContextValue {
    shortcutsHelpOpen: boolean;
    setShortcutsHelpOpen: (open: boolean) => void;
    openShortcutsHelp: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function useKeyboardShortcutsContext() {
    const context = useContext(KeyboardShortcutsContext);
    if (!context) {
        throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
    }
    return context;
}

interface KeyboardShortcutsProviderProps {
    children: React.ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
    const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

    const openShortcutsHelp = useCallback(() => {
        setShortcutsHelpOpen(true);
    }, []);

    const handleShowShortcutsHelp = useCallback(() => {
        setShortcutsHelpOpen(prev => !prev);
    }, []);

    const handleCloseModal = useCallback(() => {
        if (shortcutsHelpOpen) {
            setShortcutsHelpOpen(false);
            return true;
        }
        return false;
    }, [shortcutsHelpOpen]);

    useKeyboardShortcuts({
        onShowShortcutsHelp: handleShowShortcutsHelp,
        onCloseModal: handleCloseModal,
        enabled: true,
    });

    return (
        <KeyboardShortcutsContext.Provider
            value={{
                shortcutsHelpOpen,
                setShortcutsHelpOpen,
                openShortcutsHelp,
            }}
        >
            {children}
            <ShortcutsHelpModal
                open={shortcutsHelpOpen}
                onOpenChange={setShortcutsHelpOpen}
            />
        </KeyboardShortcutsContext.Provider>
    );
}
