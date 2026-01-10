
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, StyleSheet, useColorScheme as useRNColorScheme } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Feather';
import { getPatientList, createSession, checkAppointmentConflict } from '../../../api/therapistService';
import { PatientWithActivity } from '../../../api/types';
import { tokens } from '../../../design-system/tokens';

interface AddSessionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    therapistId: string;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({ visible, onClose, onSuccess, therapistId }) => {
    const [patients, setPatients] = useState<PatientWithActivity[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('09:00');
    const [duration, setDuration] = useState<number>(45);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sessionType, setSessionType] = useState<'private' | 'public'>('private');
    const [sessionTitle, setSessionTitle] = useState('');

    // Simple color scheme check
    const colorScheme = useRNColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        if (visible) {
            fetchPatients();
        }
    }, [visible]);

    const fetchPatients = async () => {
        setLoadingPatients(true);
        try {
            const data = await getPatientList(therapistId);
            setPatients(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load patients');
        } finally {
            setLoadingPatients(false);
        }
    };

    const handleCreate = async () => {
        if (sessionType === 'private' && !selectedPatient) {
            Alert.alert('Missing Fields', 'Please select a patient for a private session.');
            return;
        }

        if (sessionType === 'public' && !sessionTitle.trim()) {
            Alert.alert('Missing Fields', 'Please enter a title for the public session.');
            return;
        }

        if (!selectedDate || !selectedTime) {
            Alert.alert('Missing Fields', 'Please select a date and time.');
            return;
        }

        setSubmitting(true);
        try {
            // Combine date and time
            const dateParts = selectedDate.split('-').map(Number);
            const timeParts = selectedTime.split(':').map(Number);
            const sessionStart = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1]);

            const endTime = new Date(sessionStart.getTime() + duration * 60000);
            if (await checkAppointmentConflict(therapistId, sessionStart.toISOString(), endTime.toISOString())) {
                Alert.alert('Scheduling Conflict', 'This time overlaps with an existing session. Please choose another slot.');
                setSubmitting(false);
                return;
            }

            await createSession(
                therapistId,
                sessionType === 'public' ? null : selectedPatient,
                sessionStart,
                duration,
                notes,
                0, // price for now
                sessionType,
                sessionTitle
            );

            Alert.alert('Success', `${sessionType === 'public' ? 'Public' : 'Private'} session created and broadcasted!`);
            onSuccess();
            onClose();
            resetForm();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to create session. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedPatient(null);
        setSelectedDate('');
        setSelectedTime('09:00');
        setNotes('');
        setDuration(45);
        setSessionType('private');
        setSessionTitle('');
    };

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
        '15:30', '16:00', '16:30', '17:00'
    ];

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#111827' : 'white',
            padding: 20,
            paddingTop: 50,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? 'white' : '#111827',
        },
        closeButton: {
            padding: 8,
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
            borderRadius: 9999,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: 'bold',
            color: isDark ? '#d1d5db' : '#374151',
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        segmentedControl: {
            flexDirection: 'row',
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
            padding: 4,
            borderRadius: 12,
            marginBottom: 24,
        },
        segmentOption: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
        },
        segmentOptionActive: {
            backgroundColor: isDark ? '#374151' : 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 1,
            elevation: 1,
        },
        segmentText: {
            fontWeight: '600',
            marginLeft: 8,
            color: '#6b7280',
        },
        segmentTextActive: {
            color: isDark ? '#818cf8' : '#4f46e5',
        },
        input: {
            borderWidth: 1,
            borderColor: isDark ? '#374151' : '#e5e7eb',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            backgroundColor: isDark ? '#1f2937' : '#f9fafb',
            color: isDark ? 'white' : '#111827',
            fontSize: 16,
        },
        patientCard: {
            marginRight: 12,
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            backgroundColor: isDark ? '#1f2937' : 'white',
            borderColor: isDark ? '#374151' : '#e5e7eb',
            flexDirection: 'row',
            alignItems: 'center',
        },
        patientCardSelected: {
            backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#eef2ff',
            borderColor: '#6366f1',
        },
        patientAvatar: {
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
        },
        patientAvatarSelected: {
            backgroundColor: '#6366f1',
        },
        timeSlot: {
            marginRight: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 9999,
            borderWidth: 1,
        },
        createButton: {
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            backgroundColor: '#4f46e5',
            marginTop: 20,
        },
    });

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add New Session</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="x" size={20} color={isDark ? "#fff" : "#666"} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                    {/* Session Type Segmented Control */}
                    <Text style={styles.sectionTitle}>Session Type</Text>
                    <View style={styles.segmentedControl}>
                        <TouchableOpacity
                            onPress={() => setSessionType('private')}
                            style={[styles.segmentOption, sessionType === 'private' && styles.segmentOptionActive]}
                        >
                            <Icon name="user" size={16} color={sessionType === 'private' ? '#6366f1' : '#9ca3af'} />
                            <Text style={[styles.segmentText, sessionType === 'private' && styles.segmentTextActive]}>Private</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setSessionType('public')}
                            style={[styles.segmentOption, sessionType === 'public' && styles.segmentOptionActive]}
                        >
                            <Icon name="rss" size={16} color={sessionType === 'public' ? '#6366f1' : '#9ca3af'} />
                            <Text style={[styles.segmentText, sessionType === 'public' && styles.segmentTextActive]}>Public (Broadcast)</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Session Title */}
                    {(sessionType === 'public' || sessionTitle.length > 0) && (
                        <View>
                            <Text style={styles.sectionTitle}>Session Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Weekly Group Therapistship or Career Q&A"
                                value={sessionTitle}
                                onChangeText={setSessionTitle}
                                placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                            />
                        </View>
                    )}

                    {/* Patient Selection */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={styles.sectionTitle}>
                            {sessionType === 'public' ? 'Select Patients (Optional)' : 'Select Patient*'}
                        </Text>
                        {sessionType === 'public' && (
                            <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Broadcasts to all if none selected</Text>
                        )}
                    </View>

                    {loadingPatients ? (
                        <ActivityIndicator size="small" color={isDark ? "#818cf8" : "#6366f1"} style={{ marginBottom: 24 }} />
                    ) : patients.length === 0 ? (
                        <View style={{ padding: 16, backgroundColor: isDark ? '#1f2937' : '#f9fafb', borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', borderStyle: 'dashed' }}>
                            <Text style={{ textAlign: 'center', color: isDark ? '#9ca3af' : '#6b7280', fontStyle: 'italic' }}>
                                {sessionType === 'private' ? 'No active patients found. Connect with a patient first.' : 'No active patients found. Session will be broadcasted to global feed.'}
                            </Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                            {Array.from(new Map(patients.map(m => [m.patient_id, m])).values()).map((patient) => (
                                <TouchableOpacity
                                    key={patient.patient_id}
                                    onPress={() => setSelectedPatient(selectedPatient === patient.patient_id ? null : patient.patient_id)}
                                    style={[styles.patientCard, selectedPatient === patient.patient_id && styles.patientCardSelected]}
                                >
                                    <View style={[styles.patientAvatar, selectedPatient === patient.patient_id && styles.patientAvatarSelected]}>
                                        <Icon name="user" size={14} color={selectedPatient === patient.patient_id ? "#fff" : "#9ca3af"} />
                                    </View>
                                    <Text style={{ fontWeight: 'bold', color: selectedPatient === patient.patient_id ? (isDark ? '#818cf8' : '#4f46e5') : (isDark ? '#d1d5db' : '#374151') }}>
                                        {patient.full_name || 'Unknown'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Date Selection */}
                    <Text style={styles.sectionTitle}>Date</Text>
                    <Calendar
                        onDayPress={(day: any) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: '#6366f1' }
                        }}
                        theme={{
                            todayTextColor: '#6366f1',
                            arrowColor: '#6366f1',
                            calendarBackground: 'transparent',
                            monthTextColor: isDark ? '#fff' : '#000',
                            dayTextColor: isDark ? '#fff' : '#000',
                            textDisabledColor: isDark ? '#444' : '#d9e1e8',
                        }}
                        style={{ borderRadius: 10, borderWidth: 1, borderColor: isDark ? '#333' : '#eee', marginBottom: 16 }}
                    />

                    {/* Time Selection */}
                    <Text style={styles.sectionTitle}>Time</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                        {timeSlots.map(time => (
                            <TouchableOpacity
                                key={time}
                                onPress={() => setSelectedTime(time)}
                                style={[
                                    styles.timeSlot,
                                    { backgroundColor: selectedTime === time ? '#4f46e5' : (isDark ? '#1f2937' : 'white') },
                                    { borderColor: selectedTime === time ? '#4f46e5' : (isDark ? '#374151' : '#e5e7eb') }
                                ]}
                            >
                                <Text style={{ color: selectedTime === time ? 'white' : (isDark ? '#d1d5db' : '#374151') }}>{time}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Duration Selection */}
                    <Text style={styles.sectionTitle}>Duration</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        {[30, 45, 60].map(d => (
                            <TouchableOpacity
                                key={d}
                                onPress={() => setDuration(d)}
                                style={[
                                    styles.timeSlot,
                                    { backgroundColor: duration === d ? '#4f46e5' : (isDark ? '#1f2937' : 'white') },
                                    { borderColor: duration === d ? '#4f46e5' : (isDark ? '#374151' : '#e5e7eb') }
                                ]}
                            >
                                <Text style={{ color: duration === d ? 'white' : (isDark ? '#d1d5db' : '#374151') }}>{d} min</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Notes */}
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={[styles.input, { height: 100 }]}
                        multiline
                        textAlignVertical="top"
                        placeholder="Add session agenda or notes..."
                        value={notes}
                        onChangeText={setNotes}
                        placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                    />

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={submitting}
                        style={[styles.createButton, { opacity: submitting ? 0.7 : 1 }]}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Create Session</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Modal>
    );
};
