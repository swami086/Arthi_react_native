'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Slider from '@radix-ui/react-slider';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMenteeGoals } from '../_hooks/useMenteeGoals';

interface AddGoalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    menteeId: string;
    onSuccess?: (goal: any) => void;
}

export function AddGoalModal({ open, onOpenChange, menteeId, onSuccess }: AddGoalModalProps) {
    const [title, setTitle] = useState('');
    const [progress, setProgress] = useState(0);
    const [targetDate, setTargetDate] = useState('');

    const { createGoal, loading } = useMenteeGoals(menteeId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newGoal = await createGoal(title, progress, targetDate || undefined);
        if (newGoal) {
            setTitle('');
            setProgress(0);
            setTargetDate('');
            onOpenChange(false);
            if (onSuccess) onSuccess(newGoal);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white dark:bg-gray-900 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white">
                                Add Learning Goal
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Goal Title</label>
                            <Input
                                placeholder="e.g. Master React Hooks"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Current Progress</label>
                                <span className="text-sm font-bold text-primary">{progress}%</span>
                            </div>
                            <Slider.Root
                                className="relative flex w-full touch-none select-none items-center"
                                value={[progress]}
                                onValueChange={(value) => setProgress(value[0])}
                                max={100}
                                step={1}
                            >
                                <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                    <Slider.Range className="absolute h-full bg-primary" />
                                </Slider.Track>
                                <Slider.Thumb
                                    className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                />
                            </Slider.Root>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Target Date (Optional)</label>
                            <Input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={loading || !title.trim()}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Goal
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
