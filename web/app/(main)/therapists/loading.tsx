import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function TherapistsLoading() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            <div className="space-y-4">
                <LoadingSkeleton className="h-10 w-48 rounded-lg" />
                <LoadingSkeleton className="h-4 w-96 rounded" />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <LoadingSkeleton className="h-12 flex-1 rounded-2xl" />
                <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <LoadingSkeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <LoadingSkeleton key={i} className="h-[280px] rounded-3xl" />
                ))}
            </div>
        </div>
    );
}
