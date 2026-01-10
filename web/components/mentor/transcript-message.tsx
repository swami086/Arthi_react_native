import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TranscriptMessageProps {
    speaker: 'mentor' | 'mentee' | 'speaker' | 'unknown';
    timestamp?: string; // Made optional
    content: string;
    avatarUrl?: string;
    senderName?: string;
    highlightedText?: string;
}

export function TranscriptMessage({
    speaker,
    timestamp,
    content,
    avatarUrl,
    senderName,
    highlightedText
}: TranscriptMessageProps) {
    const isMentor = speaker === 'mentor';

    // Function to highlight text
    const renderContent = () => {
        if (!highlightedText) return content;

        const parts = content.split(new RegExp(`(${highlightedText})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === highlightedText.toLowerCase() ? (
                <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-yellow-100 rounded px-0.5">
                    {part}
                </span>
            ) : part
        );
    };

    return (
        <div className={cn(
            "flex gap-4 p-4 rounded-xl transition-colors",
            isMentor ? "bg-white dark:bg-[#1a2c32]" : "bg-primary/5 dark:bg-primary/10"
        )}>
            <Avatar className="h-10 w-10 mt-1">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className={cn(
                    "font-medium",
                    isMentor ? "bg-primary/10 text-primary" : "bg-white text-gray-600"
                )}>
                    {senderName ? senderName.substring(0, 2).toUpperCase() : (isMentor ? 'ME' : 'PT')}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {senderName || (isMentor ? 'Mentor' : 'Patient')}
                    </span>
                    {timestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(timestamp), 'h:mm a')}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {renderContent()}
                </p>
            </div>
        </div>
    );
}
