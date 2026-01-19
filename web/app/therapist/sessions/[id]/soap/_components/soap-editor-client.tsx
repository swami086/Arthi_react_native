'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CheckCircle, RotateCcw, Copy, Download } from 'lucide-react';
import { SoapNote } from '@/types/soap-note';
import { SoapSection } from '@/components/therapist/soap-section';
import { SoapMetadata } from '@/components/therapist/soap-metadata';
import { ProcessingStatus } from '@/components/therapist/processing-status';
import { useSoapNoteStatus } from '@/hooks/use-soap-note-status';
import { updateSoapNote, finalizeSoapNote, generateSoapNote, regenerateSoapNote } from '@/app/actions/soap';
import { toast } from 'react-hot-toast';
import { exportService } from '@/lib/services/export-service';
import { format } from 'date-fns';
import { useSessionCopilot } from '@/hooks/use-session-copilot';
import { SoapTemplateLoader } from './soap-template-loader';

// Simple debounce hook
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface SoapEditorClientProps {
    appointmentId: string;
    transcriptId: string;
    userId: string;
    therapistName?: string;
    patientName?: string;
}

const MIN_SECTION_LENGTH = 50;

export default function SoapEditorClient({ appointmentId, transcriptId, userId, therapistName, patientName = 'Patient' }: SoapEditorClientProps) {
    const router = useRouter();
    const { soapNote, status, setSoapNote, isSaving, setIsSaving, setStatus, error } = useSoapNoteStatus(appointmentId);
    const { surface, loading, error: copilotError } = useSessionCopilot({
        appointmentId,
        transcriptId,
        userId
    });
    const dataModel = surface?.dataModel;

    // Request generation if not exists
    useEffect(() => {
        if (status === 'idle' && !soapNote && !error) {
            const startGeneration = async () => {
                setStatus('generating');
                const result = await generateSoapNote(appointmentId, transcriptId);
                if (!result.success) {
                    setStatus('failed');
                    toast.error(result.error || 'Failed to generate SOAP note');
                }
                // Success handled by realtime subscription in hook
            };
            startGeneration();
        }
    }, [status, soapNote, appointmentId, transcriptId, error, setStatus]);


    const handleSectionChange = useCallback((section: keyof SoapNote, value: string) => {
        if (!soapNote) return;
        setSoapNote(prev => prev ? { ...prev, [section]: value } : null);
        setIsSaving(true);
    }, [soapNote, setSoapNote, setIsSaving]);

    // Auto-save effect
    const debouncedSoapNote = useDebounceValue(soapNote, 3000);

    useEffect(() => {
        if (debouncedSoapNote && soapNote && isSaving) {
            const save = async () => {
                const result = await updateSoapNote(soapNote.id, appointmentId, {
                    subjective: debouncedSoapNote.subjective,
                    objective: debouncedSoapNote.objective,
                    assessment: debouncedSoapNote.assessment,
                    plan: debouncedSoapNote.plan
                });

                if (result.success) {
                    setIsSaving(false);
                } else {
                    toast.error('Failed to auto-save');
                }
            };
            save();
        }
    }, [debouncedSoapNote, appointmentId, isSaving, soapNote]);

    const handleRegenerate = async () => {
        if (!confirm('This will overwrite your current edits. Are you sure you want to regenerate the SOAP note?')) return;

        setStatus('generating'); // Use generating status
        const result = await regenerateSoapNote(appointmentId, transcriptId);

        if (result.success) {
            toast.success('Regeneration started');
        } else {
            setStatus('ready'); // Revert status if failed immediate call (though edge function might fail later)
            toast.error(result.error || 'Failed to regenerate');
        }
    };

    const handleFinalize = async () => {
        if (!soapNote) return;

        // Validation
        const sections: (keyof SoapNote)[] = ['subjective', 'objective', 'assessment', 'plan'];
        const invalidSections = sections.filter(key => {
            const content = soapNote[key] as string;
            return !content || content.length < MIN_SECTION_LENGTH;
        });

        if (invalidSections.length > 0) {
            toast.error(`Sections must be at least ${MIN_SECTION_LENGTH} characters: ${invalidSections.join(', ')}`);
            return;
        }

        const confirm = window.confirm('Are you sure you want to finalize this SOAP note? It cannot be edited afterwards.');
        if (!confirm) return;

        setStatus('generating'); // Use 'generating' as proxy for processing
        const result = await finalizeSoapNote(soapNote.id, appointmentId);

        if (result.success) {
            toast.success('SOAP Note Finalized');
            router.push(`/therapist/sessions/${appointmentId}`);
        } else {
            toast.error(result.error || 'Failed to finalize');
            setStatus('ready');
        }
    };

    const handleCopy = async () => {
        if (!soapNote) return;
        // Combine text logic
        const text = `Subjective:\n${soapNote.subjective}\n\nObjective:\n${soapNote.objective}\n\nAssessment:\n${soapNote.assessment}\n\nPlan:\n${soapNote.plan}`;
        const success = await exportService.copyToClipboard(text);
        if (success) toast.success('Copied to clipboard');
    };

    const handleExport = async () => {
        if (!soapNote) return;
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const success = await exportService.exportSoapNoteAsPDF(soapNote, patientName, dateStr);
        if (success) toast.success('PDF Exported');
        else toast.error('Failed to export PDF');
    };

    if (status === 'generating' || (status === 'idle' && !error)) {
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
                    status="generating_soap"
                    type="soap"
                    progress={65} // Mock
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
                    className="mb-6 px-0 hover:bg-transparent hover:text-primary"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Back to Session
                </Button>
                <ProcessingStatus
                    status="failed"
                    type="soap"
                    error={error || 'Failed to generate SOAP note'}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    if (!soapNote) return null;

    const wordCounts = {
        subjective: soapNote.subjective.split(/\s+/).filter(w => w.length > 0).length,
        objective: soapNote.objective.split(/\s+/).filter(w => w.length > 0).length,
        assessment: soapNote.assessment.split(/\s+/).filter(w => w.length > 0).length,
        plan: soapNote.plan.split(/\s+/).filter(w => w.length > 0).length,
    };

    return (
        <div className="max-w-5xl mx-auto p-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SOAP Note Editor</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            {isSaving ? <span className="text-yellow-500">Saving...</span> : <span className="text-green-500">All changes saved</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleRegenerate} leftIcon={<RotateCcw className="w-4 h-4" />} disabled={soapNote.is_finalized}>
                        Regenerate
                    </Button>
                    <Button
                        onClick={handleFinalize}
                        disabled={soapNote.is_finalized}
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        variant={soapNote.is_finalized ? "secondary" : "primary"}
                    >
                        {soapNote.is_finalized ? 'Finalized' : 'Finalize Note'}
                    </Button>
                </div>
            </div>

            <SoapMetadata
                createdAt={soapNote.created_at}
                updatedAt={soapNote.updated_at}
                isFinalized={soapNote.is_finalized}
                wordCounts={wordCounts}
                therapistName={therapistName}
            />

            {/* AI Suggestion Box */}
            {!soapNote.is_finalized && dataModel?.analysis?.soap && (
                <div className="mb-8">
                    <SoapTemplateLoader
                        template={dataModel.analysis.soap}
                        onApply={(template) => {
                            setSoapNote(prev => prev ? {
                                ...prev,
                                subjective: template.subjective,
                                objective: template.objective,
                                assessment: template.assessment,
                                plan: template.plan
                            } : null);
                            setIsSaving(true);
                            toast.success('Applied AI suggestions to your draft');
                        }}
                    />
                </div>
            )}

            <div className="space-y-6">
                <SoapSection
                    title="Subjective"
                    icon={<span className="text-xl font-bold">S</span>}
                    color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    content={soapNote.subjective}
                    onChange={(val) => handleSectionChange('subjective', val)}
                    isEditing={!soapNote.is_finalized}
                />
                <SoapSection
                    title="Objective"
                    icon={<span className="text-xl font-bold">O</span>}
                    color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    content={soapNote.objective}
                    onChange={(val) => handleSectionChange('objective', val)}
                    isEditing={!soapNote.is_finalized}
                />
                <SoapSection
                    title="Assessment"
                    icon={<span className="text-xl font-bold">A</span>}
                    color="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    content={soapNote.assessment}
                    onChange={(val) => handleSectionChange('assessment', val)}
                    isEditing={!soapNote.is_finalized}
                />
                <SoapSection
                    title="Plan"
                    icon={<span className="text-xl font-bold">P</span>}
                    color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    content={soapNote.plan}
                    onChange={(val) => handleSectionChange('plan', val)}
                    isEditing={!soapNote.is_finalized}
                />
            </div>

            {/* Footer with Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={handleCopy} leftIcon={<Copy className="w-4 h-4" />}>
                    Copy to Clipboard
                </Button>
                <Button variant="outline" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
                    Export as PDF
                </Button>
            </div>
        </div>
    );
}
