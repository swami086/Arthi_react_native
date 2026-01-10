import { LoadingSkeleton, CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton';

export default function ProfileLoading() {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <LoadingSkeleton width={150} height={32} />
                <LoadingSkeleton width={40} height={40} borderRadius="50%" />
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
                <LoadingSkeleton width={120} height={120} borderRadius="50%" />
                <LoadingSkeleton width={200} height={24} />
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <LoadingSkeleton width={200} height={28} />
                <ListSkeleton count={3} />
            </div>
        </div>
    );
}
