'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, Calendar, Video, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GoalProgress } from '../../../_components/GoalProgress';
import { AddNoteModal } from '../../../_components/AddNoteModal';
import { AddGoalModal } from '../../../_components/AddGoalModal';
import Link from 'next/link';

interface PatientDetailClientProps {
    patient: any;
    initialGoals: any[];
    initialNotes: any[];
    initialSessions: any[];
}

export default function PatientDetailClient({ patient, initialGoals, initialNotes, initialSessions }: PatientDetailClientProps) {
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goals, setGoals] = useState(initialGoals);
    const [notes, setNotes] = useState(initialNotes);

    const handleGoalAdded = (newGoal: any) => {
        setGoals(prev => [newGoal, ...prev]);
    };

    const handleNoteAdded = (newNote: any) => {
        setNotes(prev => [newNote, ...prev]);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Link href="/therapist/patients" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Patients
            </Link>

            {/* Header / Profile */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-md">
                        <AvatarImage src={patient.avatar_url} />
                        <AvatarFallback className="text-xl">{patient.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.full_name}</h1>
                        <p className="text-gray-500">{patient.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-semibold uppercase">{patient.status}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/therapist/sessions">
                        <Button variant="outline" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Schedule
                        </Button>
                    </Link>
                    <Link href={`/messages?userId=${patient.id}`}>
                        <Button className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Message
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Goals Section */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Goals</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsGoalModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Add Goal
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {goals.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No goals set yet.</p>
                        ) : (
                            goals.map((goal) => (
                                <GoalProgress
                                    key={goal.id}
                                    title={goal.title}
                                    progress={goal.progress}
                                    date={goal.target_date}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Therapist Notes</h3>
                        <Button variant="ghost" size="sm" onClick={() => setIsNoteModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Add Note
                        </Button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {notes.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No notes added.</p>
                        ) : (
                            notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`p-4 rounded-lg border text-sm ${note.is_private ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(note.created_at).toLocaleDateString()}
                                        </span>
                                        {note.is_private && (
                                            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Private</span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Session History Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Session History</h3>
                <div className="space-y-4">
                    {initialSessions.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">No session history found.</p>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Time</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {initialSessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                                {new Date(session.start_time).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${session.status === 'confirmed' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                                    session.status === 'completed' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link href={`/therapist/sessions/${session.id}`} className="text-primary hover:underline font-medium">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <AddNoteModal
                open={isNoteModalOpen}
                onOpenChange={setIsNoteModalOpen}
                patientId={patient.id}
                onSuccess={handleNoteAdded}
            />

            <AddGoalModal
                open={isGoalModalOpen}
                onOpenChange={setIsGoalModalOpen}
                patientId={patient.id}
                onSuccess={handleGoalAdded}
            />
        </div>
    );
}
