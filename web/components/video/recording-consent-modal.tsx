'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Shield,
    HardDrive,
    Server,
    FileText,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

interface RecordingConsentModalProps {
    open: boolean;
    onConsent: () => void;
    onDecline?: () => void;
}

export function RecordingConsentModal({ open, onConsent, onDecline }: RecordingConsentModalProps) {
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        setAccepted(true);
        onConsent();
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onDecline?.()}>
            <DialogContent className="bg-background-light dark:bg-[#1a2a2e] border-slate-200 dark:border-white/10 max-w-md w-full sm:max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-[#30bae8] mb-2">
                        <Shield className="w-6 h-6" />
                        <span className="text-sm font-bold uppercase tracking-wide">Data Privacy & Security</span>
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        Recording & Data Usage Consent
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-[#94aeb8] leading-relaxed">
                        To provide you with the best experience and automated insights, we record and process session data.
                        Your privacy is our top priority.
                    </p>

                    {/* Section 1: What We Record */}
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <HardDrive className="w-4 h-4 text-[#30bae8]" />
                            What We Record
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#94aeb8] pl-6">
                            Audio and video of your session, along with transcriptions generated in real-time.
                        </p>
                    </div>

                    {/* Section 2: Processing */}
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <Server className="w-4 h-4 text-[#30bae8]" />
                            How We Process Your Data
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#94aeb8] pl-6">
                            We use OpenAI's Whisper for transcription and GPT-4o for generating session summaries and insights.
                            Data is processed securely without manual human review unless requested.
                        </p>
                    </div>

                    {/* Section 3: Storage */}
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <Shield className="w-4 h-4 text-[#30bae8]" />
                            Storage & Compliance
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#94aeb8] pl-6">
                            Data is stored in AWS Mumbai region servers, encrypted at rest and in transit.
                            We are fully compliant with the Digital Personal Data Protection (DPDP) Act, 2023.
                        </p>
                    </div>

                    {/* Section 4: Retention */}
                    <div className="space-y-2">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                            <Clock className="w-4 h-4 text-[#30bae8]" />
                            Data Retention Policy
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#94aeb8] pl-6">
                            Session recordings are retained for 30 days and then automatically deleted.
                            Transcriptions and summaries are stored securely until you request deletion.
                        </p>
                    </div>

                    <div className="bg-[#30bae8]/10 rounded-lg p-3 border border-[#30bae8]/20">
                        <p className="text-xs text-[#30bae8] font-medium flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            By continuing, you acknowledge that you understand and agree to these terms.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:gap-0">
                    <Button
                        onClick={handleAccept}
                        className="w-full bg-[#30bae8] hover:bg-[#30bae8]/90 text-white font-bold"
                    >
                        I Understand & Agree
                    </Button>
                    {onDecline && (
                        <Button
                            variant="ghost"
                            onClick={onDecline}
                            className="w-full text-slate-500 hover:text-slate-700 dark:text-[#94aeb8] dark:hover:text-white"
                        >
                            Cancel
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
