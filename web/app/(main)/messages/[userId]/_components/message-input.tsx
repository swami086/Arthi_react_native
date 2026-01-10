'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!message.trim()) return;
        onSend(message);
        setMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    return (
        <div className="p-4 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-4xl mx-auto flex items-end gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-2xl text-gray-400 hover:text-primary mb-0.5"
                    disabled={disabled}
                >
                    <Paperclip className="h-5 w-5" />
                </Button>

                <div className="relative flex-1 group">
                    <Textarea
                        ref={textareaRef}
                        placeholder="Type a message..."
                        className="min-h-[48px] max-h-32 py-3 px-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus-visible:ring-primary/20 resize-none text-sm transition-all pr-12"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 bottom-1.5 h-9 w-9 text-gray-400 hover:text-primary rounded-xl"
                        disabled={disabled}
                    >
                        <Smile className="h-5 w-5" />
                    </Button>
                </div>

                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all p-0 flex items-center justify-center shrink-0 mb-0.5"
                >
                    <Send className="h-5 w-5 text-white" />
                </Button>
            </div>
        </div>
    );
}
