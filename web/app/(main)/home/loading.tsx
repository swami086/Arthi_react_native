import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function HomeLoading() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
            {/* Greeting Section Skeleton */}
            <div className="flex justify-between items-start">
                <div className="space-y-4">
                    <LoadingSkeleton className="w-64 h-10 rounded-2xl" />
                    <LoadingSkeleton className="w-48 h-6 rounded-xl bg-opacity-50" />
                </div>
                <div className="flex gap-4">
                    <LoadingSkeleton className="w-12 h-12 rounded-2xl" />
                    <LoadingSkeleton className="w-12 h-12 rounded-2xl" />
                </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LoadingSkeleton className="h-32 rounded-3xl" />
                <LoadingSkeleton className="h-32 rounded-3xl" />
            </div>

            {/* Stats Overview Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <LoadingSkeleton key={i} className="h-40 rounded-3xl" />
                ))}
            </div>

            {/* Recent Activity Skeleton */}
            <div className="space-y-6">
                <LoadingSkeleton className="w-48 h-8 rounded-xl" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <LoadingSkeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
