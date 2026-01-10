'use client';



import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { searchAvailableMentees } from '@/lib/services/mentor-service';
import { inviteMenteeAction } from '@/app/mentor/_actions/menteeActions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function MenteeDiscoveryPage() {
    const supabase = createClient();
    const [mentees, setMentees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMentees = useCallback(async () => {
        setLoading(true);
        const data = await searchAvailableMentees(supabase, searchQuery);
        setMentees(data);
        setLoading(false);
    }, [searchQuery, supabase]);

    useEffect(() => {
        // Debounce simple effect or rely on manual search button/enter
        const timer = setTimeout(() => {
            fetchMentees();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchMentees]);

    const handleInvite = async (menteeId: string) => {
        toast.promise(
            inviteMenteeAction(menteeId),
            {
                loading: 'Sending invitation...',
                success: (data) => {
                    if (!data.success) throw new Error(data.error);
                    // Optimistic update: remove from list or mark as invited
                    setMentees(prev => prev.map(m => m.id === menteeId ? { ...m, invited: true } : m));
                    return 'Invitation sent!';
                },
                error: (err) => `Failed: ${err.message}`
            }
        );
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discover Mentees</h1>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                    placeholder="Search by name or interest..."
                    className="pl-10 h-12 text-lg bg-white dark:bg-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listContent(loading, mentees, handleInvite)}
            </div>
        </div>
    );
}

function listContent(loading: boolean, mentees: any[], onInvite: (id: string) => void) {
    if (loading) return [1, 2, 3].map(i => <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />);

    if (mentees.length === 0) return <p className="col-span-full text-center text-gray-500 py-10">No mentees found.</p>;

    return mentees.map(mentee => (
        <div key={mentee.id} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center">
            <div className="relative">
                <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={mentee.avatar_url} />
                    <AvatarFallback>{mentee.full_name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <Badge className="absolute -right-2 -top-2 bg-green-500 hover:bg-green-600">
                    {mentee.matchPercentage}% Match
                </Badge>
            </div>

            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{mentee.full_name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">Looking for mentorship in React, Career Growth, and System Design.</p>

            <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg p-2 w-full gap-2 justify-center mb-6">
                <Badge variant="outline" className="bg-white dark:bg-black">React</Badge>
                <Badge variant="outline" className="bg-white dark:bg-black">Career</Badge>
            </div>

            <Button className="w-full gap-2" onClick={() => onInvite(mentee.id)}>
                <Plus className="h-4 w-4" /> Invite to Connect
            </Button>
        </div>
    ));
}
