
import React from 'react';
import { Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CrisisResourcesPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Crisis Support</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        If you are in immediate danger, please call your local emergency number immediately.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 text-left mt-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-2">Emergency Services</h3>
                        <p className="text-3xl font-black text-red-600 mb-1">911</p>
                        <p className="text-sm text-gray-500">Available 24/7 for immediate assistance</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-2">Suicide & Crisis Lifeline</h3>
                        <p className="text-3xl font-black text-blue-600 mb-1">988</p>
                        <p className="text-sm text-gray-500">Free, confidential support 24/7</p>
                    </div>
                </div>

                <div className="pt-6">
                    <Link href="/home">
                        <Button variant="outline">Return Home</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
