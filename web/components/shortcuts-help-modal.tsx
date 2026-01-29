'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    getShortcutGroups,
    searchShortcuts,
    formatShortcutKeys,
    type Shortcut,
    type ShortcutGroup,
} from '@/lib/shortcuts-config';
import { Search, Keyboard, Printer, X } from 'lucide-react';

interface ShortcutsHelpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ShortcutKey({ children }: { children: React.ReactNode }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 shadow-sm">
            {children}
        </kbd>
    );
}

function ShortcutRow({ shortcut }: { shortcut: Shortcut }) {
    const formattedKeys = formatShortcutKeys(shortcut.keys, shortcut.isSequence);
    const keyParts = shortcut.isSequence
        ? shortcut.keys
        : formattedKeys.split('+');

    return (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <span className="text-sm text-slate-700 dark:text-slate-300">
                {shortcut.description}
            </span>
            <div className="flex items-center gap-1">
                {shortcut.isSequence ? (
                    <>
                        <ShortcutKey>{shortcut.keys[0].toUpperCase()}</ShortcutKey>
                        <span className="text-xs text-slate-400 mx-1">then</span>
                        <ShortcutKey>{shortcut.keys[1] === '?' ? '?' : shortcut.keys[1].toUpperCase()}</ShortcutKey>
                    </>
                ) : (
                    keyParts.map((key, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="text-xs text-slate-400">+</span>}
                            <ShortcutKey>{key}</ShortcutKey>
                        </React.Fragment>
                    ))
                )}
            </div>
        </div>
    );
}

function ShortcutSection({ group }: { group: ShortcutGroup }) {
    return (
        <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 px-3">
                {group.label}
            </h3>
            <div className="space-y-1">
                {group.shortcuts.map(shortcut => (
                    <ShortcutRow key={shortcut.id} shortcut={shortcut} />
                ))}
            </div>
        </div>
    );
}

export function ShortcutsHelpModal({ open, onOpenChange }: ShortcutsHelpModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const shortcutGroups = useMemo(() => getShortcutGroups(), []);

    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) {
            return shortcutGroups;
        }

        const matchingShortcuts = searchShortcuts(searchQuery);
        const matchingIds = new Set(matchingShortcuts.map(s => s.id));

        return shortcutGroups
            .map(group => ({
                ...group,
                shortcuts: group.shortcuts.filter(s => matchingIds.has(s.id)),
            }))
            .filter(group => group.shortcuts.length > 0);
    }, [searchQuery, shortcutGroups]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Keyboard Shortcuts - SafeSpace</title>
                        <style>
                            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { font-size: 24px; margin-bottom: 32px; }
                            h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-top: 24px; margin-bottom: 12px; }
                            .shortcut { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                            .description { color: #333; }
                            .keys { font-family: monospace; background: #f5f5f5; padding: 2px 8px; border-radius: 4px; }
                        </style>
                    </head>
                    <body>
                        <h1>Keyboard Shortcuts</h1>
                        ${shortcutGroups.map(group => `
                            <h2>${group.label}</h2>
                            ${group.shortcuts.map(s => `
                                <div class="shortcut">
                                    <span class="description">${s.description}</span>
                                    <span class="keys">${formatShortcutKeys(s.keys, s.isSequence)}</span>
                                </div>
                            `).join('')}
                        `).join('')}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5 text-primary" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search shortcuts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2 text-sm rounded-xl border-2 border-slate-100 dark:border-slate-800",
                                "bg-slate-50 dark:bg-slate-900 focus:border-primary focus:outline-none",
                                "placeholder:text-slate-400"
                            )}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrint}
                        className="flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                    {filteredGroups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <div>
                                {filteredGroups
                                    .filter((_, i) => i % 2 === 0)
                                    .map(group => (
                                        <ShortcutSection key={group.category} group={group} />
                                    ))}
                            </div>
                            <div>
                                {filteredGroups
                                    .filter((_, i) => i % 2 === 1)
                                    .map(group => (
                                        <ShortcutSection key={group.category} group={group} />
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Keyboard className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>No shortcuts found for &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 text-center">
                        Press <ShortcutKey>Esc</ShortcutKey> to close or <ShortcutKey>Cmd</ShortcutKey>+<ShortcutKey>/</ShortcutKey> to toggle
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
