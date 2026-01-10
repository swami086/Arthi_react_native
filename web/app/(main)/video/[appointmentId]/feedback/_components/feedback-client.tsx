'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitSessionFeedback } from '@/app/actions/video';
import { toast } from 'sonner';
import { Star, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils'; // Assuming utils exist

const feedbackSchema = z.object({
    rating: z.number().min(1, 'Please provide a rating').max(5),
    feedback: z.string().optional(),
    tags: z.array(z.string()).optional()
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const FEEDBACK_TAGS = [
    "Helpful", "Good Listener", "Insightful", "Professional",
    "Empathetic", "Clear Guidance", "Supportive"
];

export default function FeedbackClient({ appointment, user, role }: { appointment: any, user: any, role: string }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            rating: 0,
            feedback: '',
            tags: []
        }
    });

    const rating = form.watch('rating');
    const selectedTags = form.watch('tags') || [];

    const toggleTag = (tag: string) => {
        const current = selectedTags;
        if (current.includes(tag)) {
            form.setValue('tags', current.filter(t => t !== tag));
        } else {
            form.setValue('tags', [...current, tag]);
        }
    };

    const onSubmit = async (data: FeedbackFormValues) => {
        setSubmitting(true);
        try {
            // Append tags to feedback text for now if DB structure is simple
            const fullComment = `${data.feedback || ''} \n\nTags: ${data.tags?.join(', ')}`.trim();

            const result = await submitSessionFeedback(
                appointment.id,
                data.rating,
                fullComment,
                user.id,
                role as 'mentor' | 'mentee'
            );

            if (result.success) {
                toast.success('Thank you for your feedback!');
                router.push('/appointments'); // Redirect to dashboard
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            toast.error('Failed to submit feedback');
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        router.push('/appointments');
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-[#0e181b] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white dark:bg-[#1a2a2e] rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-white/5"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Session Completed!</h1>
                    <p className="text-slate-500 dark:text-[#94aeb8]">How was your experience with {appointment.mentor.full_name}?</p>
                </div>

                <div className="flex justify-center mb-8">
                    <Avatar className="w-20 h-20 border-4 border-white dark:border-[#30bae8]/20 shadow-lg">
                        <AvatarImage src={appointment.mentor.avatar_url} />
                        <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Stars */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => form.setValue('rating', star)}
                                className="group relative p-2 transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-colors",
                                        star <= rating
                                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                                            : "fill-transparent text-slate-300 dark:text-white/20"
                                    )}
                                />
                            </button>
                        ))}
                    </div>
                    {form.formState.errors.rating && (
                        <p className="text-center text-red-500 text-sm mt-1">{form.formState.errors.rating.message}</p>
                    )}

                    {/* Chips */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {FEEDBACK_TAGS.map(tag => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                        isSelected
                                            ? "bg-[#30bae8] border-[#30bae8] text-white shadow-lg shadow-[#30bae8]/25"
                                            : "bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#94aeb8] hover:border-[#30bae8]/50"
                                    )}
                                >
                                    {tag}
                                </button>
                            );
                        })}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Share your thoughts (optional)..."
                            className="bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10 min-h-[100px] resize-none focus-visible:ring-[#30bae8]"
                            {...form.register('feedback')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="w-full h-12 bg-[#30bae8] hover:bg-[#30bae8]/90 text-white font-bold rounded-xl shadow-lg"
                        >
                            {submitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleSkip}
                            className="w-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            Skip for now
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
