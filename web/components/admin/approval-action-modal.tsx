'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ApprovalActionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'approve' | 'reject';
    mentorName: string;
    onConfirm: (reason: string) => Promise<void>;
    isLoading?: boolean;
}

export function ApprovalActionModal({
    open,
    onOpenChange,
    type,
    mentorName,
    onConfirm,
    isLoading
}: ApprovalActionModalProps) {
    const [reason, setReason] = useState('');

    const handleConfirm = async () => {
        await onConfirm(reason);
        setReason('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8">
                <DialogHeader className="flex flex-col items-center text-center gap-4">
                    <div className={cn(
                        "h-16 w-16 rounded-3xl flex items-center justify-center",
                        type === 'approve' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    )}>
                        {type === 'approve' ? <CheckCircle2 className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-black text-gray-900 dark:text-white">
                            {type === 'approve' ? 'Approve Mentor' : 'Reject Application'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-bold mt-1">
                            {type === 'approve'
                                ? `You're about to approve ${mentorName} as an official mentor.`
                                : `Please provide a reason for rejecting ${mentorName}'s application.`}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="py-6">
                    <Textarea
                        placeholder={type === 'approve' ? "Additional notes (optional)..." : "Reason for rejection (required)..."}
                        className="rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 focus:ring-primary min-h-[120px] font-medium"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <DialogFooter className="sm:justify-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl font-bold px-8 h-12"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant={type === 'approve' ? 'primary' : 'error'}
                        className="rounded-xl font-black px-8 h-12 shadow-lg"
                        onClick={handleConfirm}
                        disabled={isLoading || (type === 'reject' && !reason.trim())}
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            type === 'approve' ? 'Confirm Approval' : 'Reject Application'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
