import { useState } from 'react';
import { supabase } from '../../../api/supabase';

export const useSessionFeedback = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitFeedback = async (
        appointmentId: string,
        rating: number,
        feedback?: string,
        categories?: string[]
    ) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Get therapist ID from appointment
            const { data: appointment } = await supabase
                .from('appointments')
                .select('therapist_id')
                .eq('id', appointmentId)
                .single();

            if (!appointment) throw new Error('Appointment not found');

            // Insert review
            const { error: reviewError } = await supabase
                .from('reviews')
                .insert({
                    therapist_id: appointment.therapist_id,
                    patient_id: user.id,
                    appointment_id: appointmentId,
                    rating,
                    comment: feedback || categories?.join(', '),
                });

            if (reviewError) throw reviewError;

            // Update appointment feedback
            const { error: apptError } = await supabase
                .from('appointments')
                .update({
                    feedback: feedback || categories?.join(', ')
                })
                .eq('id', appointmentId);

            if (apptError) throw apptError;

            return true;
        } catch (err: any) {
            setError(err.message);
            console.error('Error submitting feedback:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        submitFeedback
    };
};
