import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type ProcessStep = 'recording' | 'uploading' | 'transcribing' | 'generating_soap' | 'completed' | 'failed';

interface ProcessingStatusProps {
    status: ProcessStep;
    progress?: number; // 0-100
    error?: string;
    onRetry?: () => void;
    onView?: () => void;
    type: 'transcript' | 'soap';
}

export function ProcessingStatus({
    status,
    progress = 0,
    error,
    onRetry,
    onView,
    type
}: ProcessingStatusProps) {
    const isError = status === 'failed';
    const isCompleted = status === 'completed';
    const isLoading = !isError && !isCompleted && status !== 'recording';

    const getStatusText = () => {
        switch (status) {
            case 'uploading': return 'Uploading Audio...';
            case 'transcribing': return 'Transcribing Audio...';
            case 'generating_soap': return 'Generating SOAP Note...';
            case 'completed': return type === 'transcript' ? 'Transcript Ready' : 'SOAP Note Ready';
            case 'failed': return 'Processing Failed';
            default: return 'Waiting...';
        }
    };

    const getIcon = () => {
        if (isError) return <AlertCircle className="w-6 h-6 text-red-500" />;
        if (isCompleted) return <CheckCircle className="w-6 h-6 text-green-500" />;
        return <Loader2 className="w-6 h-6 text-primary animate-spin" />;
    };

    return (
        <div className="bg-white dark:bg-[#1a2c32] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={cn(
                    "p-3 rounded-full",
                    isError ? "bg-red-50 dark:bg-red-900/20" :
                        isCompleted ? "bg-green-50 dark:bg-green-900/20" :
                            "bg-primary/10"
                )}>
                    {getIcon()}
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {getStatusText()}
                    </h3>

                    {error ? (
                        <p className="text-sm text-red-500">{error}</p>
                    ) : isLoading ? (
                        <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Processing</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {type === 'transcript' ?
                                'Audio has been successfully transcribed.' :
                                'AI-generated SOAP note is ready for review.'}
                        </p>
                    )}
                </div>

                <div>
                    {isError && onRetry && (
                        <Button variant="outline" size="sm" onClick={onRetry}>
                            Retry
                        </Button>
                    )}
                    {isCompleted && onView && (
                        <Button size="sm" onClick={onView}>
                            View {type === 'transcript' ? 'Transcript' : 'SOAP Note'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
