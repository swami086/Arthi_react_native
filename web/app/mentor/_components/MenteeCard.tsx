'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, XCircle } from 'lucide-react';
import Link from 'next/link';

interface MenteeCardProps {
    mentee: {
        id: string;
        full_name: string;
        avatar_url?: string;
        status?: 'active' | 'pending' | 'completed';
        next_session?: string;
        goals_completed?: number;
        total_goals?: number;
    };
    onRemove?: (id: string) => void;
}

export function MenteeCard({ mentee, onRemove }: MenteeCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={mentee.avatar_url} />
                    <AvatarFallback>{mentee.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{mentee.full_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant={mentee.status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                            {mentee.status || 'Active'}
                        </Badge>
                        {mentee.next_session && (
                            <span className="text-xs text-gray-500">
                                Next: {new Date(mentee.next_session).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Link href={`/mentor/messages?recipient=${mentee.id}`}>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </Link>
                <Link href={`/mentor/mentees/${mentee.id}`}>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primary">
                        <User className="h-5 w-5" />
                    </Button>
                </Link>
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => onRemove(mentee.id)}
                    >
                        <XCircle className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
