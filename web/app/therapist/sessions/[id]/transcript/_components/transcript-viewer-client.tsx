'use client';

import { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TranscriptMessage } from '@/components/therapist/transcript-message';
import { TranscriptSearch } from '@/components/therapist/transcript-search';
import { ProcessingStatus } from '@/components/therapist/processing-status';
import { exportService } from '@/lib/services/export-service';
import { useTranscriptStatus } from '@/hooks/use-transcript-status';
import { toast } from 'react-hot-toast';

interface TranscriptViewerClientProps {
    recordingId: string;
    appointmentId: string;
    therapistName?: string;
}

interface TranscriptMessageData {
    id: string; // Changed to string for flexibility
    speaker: string;
    text: string;
    timestamp?: string;
}

export default function TranscriptViewerClient({ recordingId, appointmentId, therapistName }: TranscriptViewerClientProps) {
    const router = useRouter();
    const { transcript, status, error } = useTranscriptStatus(recordingId);
    const parentRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    const messages = useMemo(() => {
        if (!transcript?.transcript_text) return [];

        const lines = transcript.transcript_text.split('\n');
        return lines.map((line: string, index: number) => {
            const match = line.match(/^(Speaker \w+|Therapist|Patient|Patient): (.*)/i);
            if (match) {
                return {
                    id: `msg-${index}`,
                    speaker: match[1],
                    text: match[2],
                    timestamp: undefined
                };
            }
            return {
                id: `msg-${index}`,
                speaker: 'Unknown',
                text: line,
                timestamp: undefined
            };
        })
            .filter((msg: TranscriptMessageData) => msg.text.trim().length > 0)
            .reduce((acc: TranscriptMessageData[], msg: TranscriptMessageData, index: number) => {
                // Merge consecutive messages from same speaker
                if (index > 0 && acc.length > 0 && acc[acc.length - 1].speaker === msg.speaker) {
                    acc[acc.length - 1].text += ' ' + msg.text;
                    return acc;
                }
                acc.push(msg);
                return acc;
            }, []);
    }, [transcript]);

    const filteredIndices = useMemo(() => {
        if (!searchQuery) return [];
        return messages.reduce((acc: number[], msg: TranscriptMessageData, index: number) => {
            if (msg.text.toLowerCase().includes(searchQuery.toLowerCase())) {
                acc.push(index);
            }
            return acc;
        }, []);
    }, [messages, searchQuery]);

    const rowVirtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
        overscan: 5,
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentMatchIndex(0);
        if (query && filteredIndices.length > 0) {
            rowVirtualizer.scrollToIndex(filteredIndices[0], { align: 'center' });
        }
    };

    const handleNextMatch = () => {
        if (filteredIndices.length === 0) return;
        const nextIndex = (currentMatchIndex + 1) % filteredIndices.length;
        setCurrentMatchIndex(nextIndex);
        rowVirtualizer.scrollToIndex(filteredIndices[nextIndex], { align: 'center' });
    };

    const handlePrevMatch = () => {
        if (filteredIndices.length === 0) return;
        const prevIndex = (currentMatchIndex - 1 + filteredIndices.length) % filteredIndices.length;
        setCurrentMatchIndex(prevIndex);
        rowVirtualizer.scrollToIndex(filteredIndices[prevIndex], { align: 'center' });
    };

    const handleExport = async () => {
        if (!transcript) return;
        const success = await exportService.exportTranscriptAsText(
            transcript.transcript_text,
            `transcript-${format(new Date(), 'yyyy-MM-dd')}`
        );
        if (success) toast.success('Transcript downloaded');
        else toast.error('Download failed');
    };

    if (status === 'processing' || status === 'pending') {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Back to Session
                </Button>
                <ProcessingStatus
                    status="transcribing"
                    type="transcript"
                    progress={50} // Mock progress
                />
            </div>
        );
    }

    if (error || status === 'failed') {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Back to Session
                </Button>
                <ProcessingStatus
                    status="failed"
                    type="transcript"
                    error={error || 'Failed to load transcript'}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="pl-0 hover:bg-transparent hover:text-primary"
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Session Transcript</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {messages.length} messages • {transcript?.word_count || 0} words
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <TranscriptSearch
                        onSearch={handleSearch}
                        matchCount={filteredIndices.length}
                        currentMatch={currentMatchIndex}
                        onNextMatch={handleNextMatch}
                        onPrevMatch={handlePrevMatch}
                    />
                    <Button variant="outline" size="sm" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Content using Virtual Scrolling */}
            <div
                ref={parentRef}
                className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111d21] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 scroll-smooth"
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const message = messages[virtualRow.index];
                        return (
                            <div
                                key={virtualRow.index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                                className="pb-4 px-2"
                            >
                                <TranscriptMessage
                                    speaker={message.speaker as any}
                                    timestamp={message.timestamp}
                                    content={message.text}
                                    highlightedText={searchQuery}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
