import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-8">
                <LoadingSkeleton className="h-10 w-64 rounded-lg" />
                <LoadingSkeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LoadingSkeleton className="h-40 rounded-2xl shadow-sm" />
                <LoadingSkeleton className="h-40 rounded-2xl shadow-sm" />
                <LoadingSkeleton className="h-40 rounded-2xl shadow-sm" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section Skeleton */}
                <div className="lg:col-span-2">
                    <LoadingSkeleton className="h-[400px] rounded-2xl shadow-sm" />
                </div>

                {/* Transactions Section Skeleton */}
                <div className="space-y-4">
                    <LoadingSkeleton className="h-8 w-40 rounded-lg mb-4" />
                    <LoadingSkeleton className="h-32 rounded-xl shadow-sm" />
                    <LoadingSkeleton className="h-32 rounded-xl shadow-sm" />
                    <LoadingSkeleton className="h-32 rounded-xl shadow-sm" />
                </div>
            </div>
        </div>
    );
}

