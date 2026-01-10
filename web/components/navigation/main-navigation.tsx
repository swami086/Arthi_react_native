'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Home,
    Users,
    Calendar,
    MessageSquare,
    User,
    Shield,
    Bell
} from 'lucide-react';
import { useUnreadCounts } from '@/hooks/use-unread-counts';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { cn } from '@/lib/utils';
import { reportError } from '@/lib/rollbar-utils';

const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Mentors', path: '/mentors', icon: Users },
    { label: 'Sessions', path: '/appointments', icon: Calendar },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
];

export const MainNavigation = () => {
    const pathname = usePathname();
    const { unreadMessages, unreadNotifications } = useUnreadCounts();

    try {
        return (
            <>
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-[280px] h-screen fixed left-0 top-0 border-r border-gray-100 dark:border-border-dark bg-white dark:bg-[#1a2c32] z-50">
                    <div className="p-8 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Shield size={24} className="stroke-[2.5px]" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                            Safe<span className="text-primary">Space</span>
                        </span>
                    </div>

                    <nav className="flex-1 px-4 py-8">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            className={cn(
                                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl group transition-all duration-200",
                                                isActive
                                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#233840]"
                                            )}
                                        >
                                            <item.icon
                                                size={22}
                                                className={cn(
                                                    "transition-transform duration-200 group-hover:scale-110",
                                                    isActive ? "stroke-[3px]" : "stroke-[2.5px]"
                                                )}
                                            />
                                            <span className={cn(
                                                "font-black uppercase tracking-widest text-xs",
                                                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                            )}>
                                                {item.label}
                                            </span>

                                            {item.label === 'Messages' && unreadMessages > 0 && (
                                                <div className="ml-2 relative h-5 w-5">
                                                    <NotificationBadge count={unreadMessages} className="static translate-x-0 translate-y-0" />
                                                </div>
                                            )}

                                            {item.label === 'Notifications' && unreadNotifications > 0 && (
                                                <div className="ml-2 relative h-5 w-5">
                                                    <NotificationBadge count={unreadNotifications} className="static translate-x-0 translate-y-0" />
                                                </div>
                                            )}

                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeNav"
                                                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-4 mt-auto">
                        <div className="p-4 bg-gray-50 dark:bg-[#233840] rounded-[24px] border border-gray-100 dark:border-border-dark">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Support</p>
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Need help? Contact us 24/7</p>
                        </div>
                    </div>
                </aside>

                {/* Mobile Bottom Tab Bar */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1a2c32]/80 backdrop-blur-xl border-t border-gray-100 dark:border-border-dark px-6 pt-3 pb-8 z-50 flex justify-between items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className="relative flex flex-col items-center gap-1 group"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                        "p-2.5 rounded-2xl transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-gray-400 dark:text-gray-500"
                                    )}
                                >
                                    <item.icon
                                        size={22}
                                        className={cn(isActive ? "stroke-[3px]" : "stroke-[2.5px]")}
                                    />
                                    {item.label === 'Messages' && unreadMessages > 0 && (
                                        <NotificationBadge count={unreadMessages} className="-top-1 -right-1" />
                                    )}
                                    {item.label === 'Notifications' && unreadNotifications > 0 && (
                                        <NotificationBadge count={unreadNotifications} className="-top-1 -right-1" />
                                    )}
                                </motion.div>
                                {isActive && (
                                    <motion.span
                                        layoutId="activeBubble"
                                        className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-primary"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </>
        );
    } catch (error) {
        reportError(error, 'main_navigation.render');
        return null;
    }
};
