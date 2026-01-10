import { Badge } from '@/components/ui/badge';
import { Clock, FileText, CheckCircle, AlertCircle, Edit, User } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SoapMetadataProps {
    createdAt: string;
    updatedAt: string;
    isFinalized: boolean;
    wordCounts: {
        subjective: number;
        objective: number;
        assessment: number;
        plan: number;
    };
    mentorName?: string;
}

export function SoapMetadata({
    createdAt,
    updatedAt,
    isFinalized,
    wordCounts,
    mentorName
}: SoapMetadataProps) {
    const totalWords = Object.values(wordCounts).reduce((a, b) => a + b, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#1a2c32] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Status</p>
                        <div className="flex items-center gap-2">
                            <Badge variant={isFinalized ? "default" : "secondary"} className={
                                isFinalized
                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }>
                                {isFinalized ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                {isFinalized ? 'Finalized' : 'Draft'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2c32] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Words</p>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{totalWords}</span>
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="link" className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 mt-1">View Details</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Word Count Breakdown</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between"><span>Subjective:</span> <span>{wordCounts.subjective}</span></div>
                                    <div className="flex justify-between"><span>Objective:</span> <span>{wordCounts.objective}</span></div>
                                    <div className="flex justify-between"><span>Assessment:</span> <span>{wordCounts.assessment}</span></div>
                                    <div className="flex justify-between"><span>Plan:</span> <span>{wordCounts.plan}</span></div>
                                    <div className="border-t pt-2 font-bold flex justify-between"><span>Total:</span> <span>{totalWords}</span></div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2c32] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Last Edited</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{format(new Date(updatedAt), 'MMM d, h:mm a')}</span>

                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created: {format(new Date(createdAt), 'MMM d')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2c32] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Edited By</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{mentorName || 'Unknown Mentor'}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Mentor
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
