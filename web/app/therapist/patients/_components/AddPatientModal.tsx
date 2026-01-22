'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createPatientAction } from '../../_actions/patientActions';

interface AddPatientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddPatientModal({ open, onOpenChange, onSuccess }: AddPatientModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phoneNumber: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createPatientAction({
                email: formData.email,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber || undefined,
            });

            if (result.success) {
                toast.success('Patient created successfully!');
                setFormData({ email: '', fullName: '', phoneNumber: '' });
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(result.error || 'Failed to create patient');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                    <DialogDescription>
                        Create a new patient account. They will receive an email invitation to complete their profile.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="patient@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="+1 (555) 123-4567"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !formData.email || !formData.fullName}>
                            {loading ? 'Creating...' : 'Create Patient'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
