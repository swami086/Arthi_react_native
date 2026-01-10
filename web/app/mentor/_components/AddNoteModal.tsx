'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTherapistNotes } from '../_hooks/useTherapistNotes';

interface AddNoteModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    onSuccess?: (note: any) => void;
}

export function AddNoteModal({ open, onOpenChange, patientId, onSuccess }: AddNoteModalProps) {
    const [content, setContent] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const { createNote, loading } = useTherapistNotes(patientId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const newNote = await createNote(content, isPrivate);
        if (newNote) {
            setContent('');
            onOpenChange(false);
            if (onSuccess) onSuccess(newNote);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white dark:bg-gray-900 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white">
                                Add Therapist Note
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </Dialog.Close>
                        </div>
                        <Dialog.Description className="text-sm text-gray-500">
                            Add a note about this patient's progress.
                        </Dialog.Description>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900 dark:text-gray-100"
                            placeholder="Write your observation..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            autoFocus
                        />

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <Switch.Root
                                    checked={isPrivate}
                                    onCheckedChange={setIsPrivate}
                                    className="peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                                >
                                    <Switch.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
                                </Switch.Root>
                                Private Note
                            </label>

                            <Button type="submit" disabled={loading || !content.trim()}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Note
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
