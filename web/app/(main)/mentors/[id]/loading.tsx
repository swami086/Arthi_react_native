import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function MentorDetailLoading() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <LoadingSkeleton className="w-32 h-32 rounded-full" />
                <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2 flex flex-col items-center md:items-start">
                        <LoadingSkeleton className="h-4 w-24 rounded-full" />
                        <LoadingSkeleton className="h-10 w-3/4 rounded-lg" />
                    </div>

                    <div className="flex justify-center md:justify-start gap-6 pt-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-1">
                                <LoadingSkeleton className="h-6 w-12 mx-auto md:mx-0" />
                                <LoadingSkeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* About Skeleton */}
            <div className="space-y-4">
                <LoadingSkeleton className="h-6 w-32" />
                <div className="space-y-2">
                    <LoadingSkeleton className="h-4 w-full" />
                    <LoadingSkeleton className="h-4 w-full" />
                    <LoadingSkeleton className="h-4 w-3/4" />
                </div>
            </div>

            {/* Tags Skeleton */}
            <div className="space-y-4">
                <LoadingSkeleton className="h-6 w-40" />
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <LoadingSkeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                </div>
            </div>

            {/* Reviews Skeleton */}
            <div className="space-y-4">
                <LoadingSkeleton className="h-6 w-32" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2].map((i) => (
                        <LoadingSkeleton key={i} className="h-40 w-72 rounded-2xl flex-shrink-0" />
                    ))}
                </div>
            </div>
        </div>
    );
}
