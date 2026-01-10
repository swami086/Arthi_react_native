'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Share2, LogOut, Settings, User, Wallet, MessageSquare, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUnreadCounts } from '@/hooks/use-unread-counts';
import { NotificationBadge } from '@/components/ui/notification-badge';

interface SidebarProps {
    userEmail?: string;
    userName?: string;
    userAvatar?: string;
}

export function TherapistSidebar({ userEmail, userName }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const { unreadMessages, unreadNotifications } = useUnreadCounts();

    const navigation = [
        { name: 'Dashboard', href: '/therapist/home', icon: Home },
        { name: 'My Patients', href: '/therapist/patients', icon: Users },
        { name: 'Sessions', href: '/therapist/sessions', icon: Calendar },
        { name: 'Payments', href: '/therapist/payments', icon: Wallet },
        { name: 'Messages', href: '/messages', icon: MessageSquare },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Referrals', href: '/therapist/referrals', icon: Share2 },
    ];

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/login');
            toast.success('Signed out successfully');
        } catch (error) {
            toast.error('Error signing out');
        }
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="flex h-16 items-center px-6 border-b dark:border-gray-800">
                <span className="text-lg font-bold text-primary">SafeSpace</span>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-1 flex-1 space-y-1 px-4">
                    {navigation.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300',
                                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300',
                                        'mr-3 h-5 w-5 flex-shrink-0'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}

                                {item.name === 'Messages' && unreadMessages > 0 && (
                                    <div className="ml-auto relative w-5 h-5 flex items-center justify-center">
                                        <NotificationBadge count={unreadMessages} className="static translate-x-0 translate-y-0" />
                                    </div>
                                )}

                                {item.name === 'Notifications' && unreadNotifications > 0 && (
                                    <div className="ml-auto relative w-5 h-5 flex items-center justify-center">
                                        <NotificationBadge count={unreadNotifications} className="static translate-x-0 translate-y-0" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t p-4 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {userName || 'Therapist'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {userEmail}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/10"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
