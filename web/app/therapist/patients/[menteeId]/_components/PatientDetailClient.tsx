
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
    patient: any;
    initialGoals: any[];
    initialNotes: any[];
    initialSessions: any[];
}

export default function PatientDetailClient({ patient, initialGoals, initialNotes, initialSessions }: Props) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'notes'>('overview');

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{patient.full_name}</h1>
                    <p className="text-gray-500 text-sm">{patient.email}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
                {(['overview', 'goals', 'notes'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                            <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold mb-4">Patient Information</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{patient.phone_number || 'N/A'}</dd></div>
                                <div className="flex justify-between"><dt className="text-gray-500">Gender</dt><dd>{patient.gender || 'N/A'}</dd></div>
                                <div className="flex justify-between"><dt className="text-gray-500">Joined</dt><dd>{new Date(patient.created_at).toLocaleDateString()}</dd></div>
                            </dl>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold mb-4">Recent Sessions</h3>
                            {initialSessions.length > 0 ? (
                                <ul className="space-y-3">
                                    {initialSessions.slice(0, 3).map((session: any) => (
                                        <li key={session.id} className="text-sm flex justify-between">
                                            <span>{new Date(session.start_time).toLocaleDateString()}</span>
                                            <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">{session.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">No recent sessions</p>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'goals' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold">Therapy Goals</h3>
                            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Goal</Button>
                        </div>
                        {initialGoals.length > 0 ? (
                            <ul className="space-y-2">
                                {initialGoals.map((goal: any) => (
                                    <li key={goal.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                        {goal.description}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No goals set yet.</p>
                        )}
                    </div>
                )}
                {activeTab === 'notes' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold">Session Notes</h3>
                            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Note</Button>
                        </div>
                        {initialNotes.length > 0 ? (
                            <ul className="space-y-4">
                                {initialNotes.map((note: any) => (
                                    <li key={note.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="text-xs text-gray-500 mb-2">{new Date(note.created_at).toLocaleString()}</div>
                                        <p>{note.content}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No notes recorded.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
