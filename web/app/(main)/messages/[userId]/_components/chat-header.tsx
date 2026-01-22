'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientAvatar } from '@/components/ui/gradient-avatar';

interface ChatHeaderProps {
    user: {
        full_name: string;
        avatar_url?: string;
        role: string;
    };
    isOnline?: boolean;
}

export default function ChatHeader({ user, isOnline = false, backUrl = '/messages' }: ChatHeaderProps & { backUrl?: string }) {
    const router = useRouter();

    return (
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(backUrl)}
                    className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <GradientAvatar
                            alt={user.full_name}
                            src={user.avatar_url || ''}
                            size={44}
                        />
                        {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black shadow-sm" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-base font-black text-gray-900 dark:text-white leading-tight">
                            {user.full_name}
                        </h2>
                        <p className="text-[10px] uppercase font-black tracking-widest text-primary opacity-80">
                            {isOnline ? 'Online Now' : user.role}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-primary">
                    <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-primary">
                    <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-primary">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
