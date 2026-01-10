'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Clock,
    Users,
    GraduationCap,
    Shield,
    LogOut,
    Settings,
    User,
    ChevronLeft,
    Menu,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    userEmail?: string;
    userName?: string;
    isSuperAdmin?: boolean;
}

export function AdminSidebar({ userEmail, userName, isSuperAdmin }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Pending Approvals', href: '/admin/pending-approvals', icon: Clock },
        { name: 'Therapists', href: '/admin/therapists', icon: Users },
        { name: 'Patients', href: '/admin/patients', icon: GraduationCap },
        { name: 'Admins', href: '/admin/admins', icon: Shield },
        { name: 'Audit Trail', href: '/admin/audit', icon: Activity },
    ];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error('Error logging out');
        } else {
            router.push('/login');
            router.refresh();
        }
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r dark:border-gray-800 transition-all duration-300">
            {/* Logo Section */}
            <div className="h-20 flex items-center px-6 border-b dark:border-gray-800">
                <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
                    <Shield className="text-white h-6 w-6" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3 overflow-hidden whitespace-nowrap"
                    >
                        <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
                            SAFE<span className="text-primary text-2xl">SPACE</span>
                        </span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 -mt-1">
                            Admin Portal
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-1"
                                    : "text-gray-500 hover:text-primary hover:bg-primary/5 dark:text-gray-400 dark:hover:text-primary"
                            )}
                            title={isCollapsed ? item.name : ""}
                        >
                            <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                            {isActive && !isCollapsed && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Profile Section */}
            <div className="p-4 border-t dark:border-gray-800 space-y-2">
                {!isCollapsed && (
                    <div className="px-4 py-4 rounded-3xl bg-gray-50 dark:bg-gray-900/50 mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                            {userName?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{userName}</p>
                            <p className="text-[10px] font-bold text-gray-500 truncate">{userEmail}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <Link href="/admin/settings">
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 h-12 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:text-primary",
                                isCollapsed ? "px-0 justify-center" : ""
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            {!isCollapsed && <span>Settings</span>}
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className={cn(
                            "w-full justify-start gap-3 h-12 rounded-2xl font-bold text-red-500 hover:bg-red-500/10",
                            isCollapsed ? "px-0 justify-center" : ""
                        )}
                    >
                        <LogOut className="h-5 w-5" />
                        {!isCollapsed && <span>Logout</span>}
                    </Button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex w-full items-center justify-center h-10 mt-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", isCollapsed && "rotate-180")} />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn(
                "hidden lg:block h-screen transition-all duration-300 relative z-40",
                isCollapsed ? "w-24" : "w-72"
            )}>
                {sidebarContent}
            </div>

            {/* Mobile Sidebar */}
            <div className="lg:hidden flex items-center h-16 px-4 bg-white dark:bg-gray-950 border-b dark:border-gray-800 fixed top-0 w-full z-30">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
                <span className="ml-4 font-black tracking-tight text-gray-900 dark:text-white">SAFE<span className="text-primary">SPACE</span></span>
            </div>

            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute left-0 top-0 h-full w-4/5 max-w-sm"
                        >
                            {sidebarContent}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
