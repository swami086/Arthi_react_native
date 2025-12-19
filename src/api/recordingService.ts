import { Alert } from 'react-native';

// PLACEHOLDER: These functions will be implemented after Supabase configuration
// For now, they use mock data and local storage

export interface SessionRecording {
  id: string;
  appointment_id: string;
  mentor_id: string;
  mentee_id: string;
  recording_url: string;
  file_size_bytes: number;
  duration_seconds: number;
  recording_status: 'recording' | 'processing' | 'completed' | 'failed';
  consent_captured: boolean;
  created_at: string;
}

export interface Transcript {
  id: string;
  recording_id: string;
  transcript_text: string;
  language_detected: string;
  word_count: number;
  created_at: string;
}

export interface SoapNote {
  id: string;
  transcript_id: string;
  appointment_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  is_finalized: boolean;
  edited_by_mentor: boolean;
  created_at: string;
  updated_at: string;
}

// Mock storage for development
const mockRecordings: Map<string, SessionRecording> = new Map();
const mockTranscripts: Map<string, Transcript> = new Map();
const mockSoapNotes: Map<string, SoapNote> = new Map();

export const createRecording = async (
  appointmentId: string,
  mentorId: string,
  menteeId: string,
  consentGiven: boolean
): Promise<SessionRecording | null> => {
  try {
    const recording: SessionRecording = {
      id: `recording_${Date.now()}`,
      appointment_id: appointmentId,
      mentor_id: mentorId,
      mentee_id: menteeId,
      recording_url: '',
      file_size_bytes: 0,
      duration_seconds: 0,
      recording_status: 'recording',
      consent_captured: consentGiven,
      created_at: new Date().toISOString(),
    };
    mockRecordings.set(recording.id, recording);
    console.log('PLACEHOLDER: Recording created (mock):', recording.id);
    return recording;
  } catch (error) {
    console.error('Error creating recording:', error);
    return null;
  }
};

export const getRecordingByAppointment = async (
  appointmentId: string
): Promise<SessionRecording | null> => {
  try {
    for (const recording of mockRecordings.values()) {
      if (recording.appointment_id === appointmentId) {
        return recording;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching recording:', error);
    return null;
  }
};

export const getTranscriptByRecording = async (
  recordingId: string
): Promise<Transcript | null> => {
  try {
    for (const transcript of mockTranscripts.values()) {
      if (transcript.recording_id === recordingId) {
        return transcript;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
};

export const getSoapNoteByAppointment = async (
  appointmentId: string
): Promise<SoapNote | null> => {
  try {
    for (const soapNote of mockSoapNotes.values()) {
      if (soapNote.appointment_id === appointmentId) {
        return soapNote;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching SOAP note:', error);
    return null;
  }
};

export const updateSoapNote = async (
  soapNoteId: string,
  updates: Partial<SoapNote>
): Promise<SoapNote | null> => {
  try {
    const soapNote = mockSoapNotes.get(soapNoteId);
    if (!soapNote) return null;

    const updated = { ...soapNote, ...updates, updated_at: new Date().toISOString() };
    mockSoapNotes.set(soapNoteId, updated);
    console.log('PLACEHOLDER: SOAP note updated (mock):', soapNoteId);
    return updated;
  } catch (error) {
    console.error('Error updating SOAP note:', error);
    return null;
  }
};

export const finalizeSoapNote = async (soapNoteId: string): Promise<boolean> => {
  try {
    const soapNote = mockSoapNotes.get(soapNoteId);
    if (!soapNote) return false;

    soapNote.is_finalized = true;
    soapNote.updated_at = new Date().toISOString();
    mockSoapNotes.set(soapNoteId, soapNote);
    console.log('PLACEHOLDER: SOAP note finalized (mock):', soapNoteId);
    return true;
  } catch (error) {
    console.error('Error finalizing SOAP note:', error);
    return false;
  }
};

export const deleteRecording = async (recordingId: string): Promise<boolean> => {
  try {
    mockRecordings.delete(recordingId);
    console.log('PLACEHOLDER: Recording deleted (mock):', recordingId);
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
};
