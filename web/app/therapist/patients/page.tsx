'use client';



import { useState } from 'react';
import { usePatientList } from '../_hooks/usePatientList';
import { PatientCard } from '../_components/PatientCard';
import { AddPatientModal } from './_components/AddPatientModal';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Search, Filter, Plus } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';

export default function PatientsPage() {
    const { patients, loading, error, removePatient, refetch } = usePatientList();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filter logic
    const filteredPatients = patients.filter(m =>
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
                    <p className="text-gray-500">Manage your active therapistships and student progress.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        ADD NEW PATIENT
                    </Button>
                    <Link href="/therapist/patients/discovery">
                        <Button variant="outline">
                            Discover Patients
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search patients..."
                        className="pl-9 bg-gray-50 dark:bg-gray-800 border-0"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {/* Simple Filters implementation instead of full Tabs if filtering locally only on Active vs others, but hook returns 'active' */}
                {/* Plan asked for Tabs. Let's add them to switch between 'Active' and 'Past' if we had data, for now just 'Active' */}
                <Tabs.Root defaultValue="active" className="w-full sm:w-auto">
                    <Tabs.List className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Tabs.Trigger
                            value="active"
                            className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                        >
                            Active
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="pending"
                            className="px-4 py-1.5 text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                        >
                            Pending
                        </Tabs.Trigger>
                    </Tabs.List>
                </Tabs.Root>
            </div>

            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-800 dark:text-red-200">Error: {error}</p>
                    </div>
                )}
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {searchQuery ? 'No patients found matching your search.' : 'No patients found.'}
                        </p>
                    </div>
                ) : (
                    filteredPatients.map(patient => (
                        <PatientCard
                            key={patient.id}
                            patient={patient}
                            onRemove={removePatient}
                        />
                    ))
                )}
            </div>

            <AddPatientModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSuccess={() => {
                    refetch?.();
                }}
            />
        </div>
    );
}
