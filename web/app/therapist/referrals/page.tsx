'use client';



import * as Tabs from '@radix-ui/react-tabs';
import { useReferrals } from '../_hooks/useReferrals';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function ReferralsPage() {
    const { received, sent, loading, handleResponse } = useReferrals();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referrals</h1>
                <p className="text-gray-500">Manage referral requests from other therapists.</p>
            </div>

            <Tabs.Root defaultValue="received" className="w-full">
                <Tabs.List className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
                    <Tabs.Trigger
                        value="received"
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
                    >
                        Received ({received.length})
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="sent"
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all"
                    >
                        Sent ({sent.length})
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="received" className="space-y-4">
                    {loading ? <LoadingSkeleton /> : received.length === 0 ? <EmptyState type="received" /> : (
                        received.map(referral => (
                            <ReferralCard
                                key={referral.id}
                                referral={referral}
                                type="received"
                                onAction={handleResponse}
                            />
                        ))
                    )}
                </Tabs.Content>

                <Tabs.Content value="sent" className="space-y-4">
                    {loading ? <LoadingSkeleton /> : sent.length === 0 ? <EmptyState type="sent" /> : (
                        sent.map(referral => (
                            <ReferralCard
                                key={referral.id}
                                referral={referral}
                                type="sent"
                            />
                        ))
                    )}
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}

function ReferralCard({ referral, type, onAction }: { referral: any, type: 'received' | 'sent', onAction?: (id: string, status: any) => void }) {
    const isPending = referral.status === 'pending';

    return (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {type === 'received' ? `Referral from ${referral.referrer?.full_name}` : `Referral to ${referral.referred?.full_name}`}
                    </h3>
                    <Badge variant={referral.status === 'pending' ? 'outline' : referral.status === 'accepted' ? 'default' : 'destructive'}>
                        {referral.status}
                    </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Patient: <span className="font-medium">{referral.patient?.full_name}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(referral.created_at), 'MMM d, yyyy')}
                </p>
            </div>

            {type === 'received' && isPending && onAction && (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onAction(referral.id, 'declined')}>
                        Decline
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onAction(referral.id, 'accepted')}>
                        <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                </div>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />)}</div>;
}

function EmptyState({ type }: { type: string }) {
    return <div className="text-center py-12 text-gray-500">No {type} referrals found.</div>;
}
