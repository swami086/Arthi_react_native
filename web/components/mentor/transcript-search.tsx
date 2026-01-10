'use client';

import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface TranscriptSearchProps {
    onSearch: (query: string) => void;
    matchCount: number;
    currentMatch: number;
    onNextMatch: () => void;
    onPrevMatch: () => void;
}

export function TranscriptSearch({
    onSearch,
    matchCount,
    currentMatch,
    onNextMatch,
    onPrevMatch
}: TranscriptSearchProps) {
    const [query, setQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onSearch(query);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query, onSearch]);

    if (!isExpanded) {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(true)}
                className="text-gray-500 hover:text-primary"
            >
                <Search className="w-5 h-5" />
            </Button>
        );
    }

    return (
        <div className="flex items-center gap-2 bg-white dark:bg-[#1a2c32] p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-right-5 text-gray-900 dark:text-gray-100">
            <Search className="w-4 h-4 text-gray-400" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search transcript..."
                className="bg-transparent border-none outline-none text-sm w-48 text-gray-900 dark:text-white placeholder-gray-500"
                autoFocus
            />

            {matchCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 border-l border-gray-200 dark:border-gray-700 pl-2 ml-1">
                    <span>{currentMatch + 1}/{matchCount}</span>
                    <div className="flex flex-col">
                        <button onClick={onPrevMatch} className="hover:text-primary"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={onNextMatch} className="hover:text-primary"><ChevronDown className="w-3 h-3" /></button>
                    </div>
                </div>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                    setQuery('');
                    setIsExpanded(false);
                }}
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
