import { supabase } from './supabase';
import { Alert } from 'react-native';

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

export const createRecording = async (
  appointmentId: string,
  mentorId: string,
  menteeId: string,
  consentGiven: boolean
): Promise<SessionRecording | null> => {
  try {
    const { data, error } = await supabase
      .from('session_recordings')
      .insert({
        appointment_id: appointmentId,
        mentor_id: mentorId,
        mentee_id: menteeId,
        consent_captured: consentGiven,
        recording_status: 'recording',
        recording_url: '', // Will be updated after upload
        file_size_bytes: 0,
        duration_seconds: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recording:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error creating recording:', error);
    return null;
  }
};

export const getRecordingByAppointment = async (
  appointmentId: string
): Promise<SessionRecording | null> => {
  try {
    const { data, error } = await supabase
      .from('session_recordings')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching recording:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching recording:', error);
    return null;
  }
};

export const getTranscriptByRecording = async (
  recordingId: string
): Promise<Transcript | null> => {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('recording_id', recordingId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
};

export const getTranscriptById = async (transcriptId: string): Promise<Transcript | null> => {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('id', transcriptId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching transcript by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching transcript by ID:', error);
    return null;
  }
};

export const getSoapNoteByAppointment = async (
  appointmentId: string
): Promise<SoapNote | null> => {
  try {
    const { data, error } = await supabase
      .from('soap_notes')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching SOAP note:', error);
      return null;
    }
    return data;
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
    const { data, error } = await supabase
      .from('soap_notes')
      .update({ ...updates, edited_by_mentor: true, updated_at: new Date().toISOString() })
      .eq('id', soapNoteId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating SOAP note:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error updating SOAP note:', error);
    return null;
  }
};

export const finalizeSoapNote = async (soapNoteId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('soap_notes')
      .update({ is_finalized: true, updated_at: new Date().toISOString() })
      .eq('id', soapNoteId);

    if (error) {
      console.error('Error finalizing SOAP note:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error finalizing SOAP note:', error);
    return false;
  }
};

export const deleteRecording = async (recordingId: string): Promise<boolean> => {
  try {
    // Note: This will delete from DB. Storage deletion relies on triggers or manual calls.
    const { error } = await supabase
      .from('session_recordings')
      .delete()
      .eq('id', recordingId);

    if (error) {
      console.error('Error deleting recording:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
};

