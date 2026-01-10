import { supabase } from './supabase';
import { reportError, withRollbarTrace, startSpan, endSpan } from '../services/rollbar';
import { Alert } from 'react-native';

import { SessionRecording, Transcript, SoapNote } from './types';

// Update createRecording (around line 15 - adapted for actual line 41)
export const createRecording = async (appointmentId: string, therapistId: string, patientId: string) => {
  startSpan('api.recording.create');
  try {
    const { data, error } = await supabase
      .from('session_recordings')
      .insert({
        appointment_id: appointmentId,
        therapist_id: therapistId,
        patient_id: patientId,
        recording_status: 'pending'
      })
      // @ts-ignore
      .headers(withRollbarTrace())
      .select()
      .single();

    if (error) {
      reportError(error, 'recordingService:createRecording', {
        appointmentId,
        therapistId,
        patientId
      });
      return null;
    }

    return data;
  } catch (error) {
    reportError(error, 'recordingService:createRecording', {
      appointmentId
    });
    return null;
  } finally {
    endSpan();
  }
};

// Update updateRecordingStatus
export const updateRecordingStatus = async (recordingId: string, status: string) => {
  startSpan('api.recording.updateStatus');
  try {
    const { data, error } = await supabase
      .from('session_recordings')
      .update({ recording_status: status })
      .eq('id', recordingId)
      // @ts-ignore
      .headers(withRollbarTrace())
      .select()
      .single();

    if (error) {
      reportError(error, 'recordingService:updateRecordingStatus', {
        recordingId,
        status
      });
      return null;
    }

    return data;
  } catch (error) {
    reportError(error, 'recordingService:updateRecordingStatus', {
      recordingId
    });
    return null;
  } finally {
    endSpan();
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
      reportError(error, 'recordingService:getRecordingByAppointment');
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching recording:', error);
    reportError(error, 'recordingService:getRecordingByAppointment');
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
    reportError(error, 'recordingService:getTranscriptByRecording');
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
    reportError(error, 'recordingService:getTranscriptById');
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
    reportError(error, 'recordingService:getSoapNoteByAppointment');
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
      .update({ ...updates, edited_by_therapist: true, updated_at: new Date().toISOString() })
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
    reportError(error, 'recordingService:updateSoapNote');
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
      reportError(error, 'recordingService:finalizeSoapNote');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error finalizing SOAP note:', error);
    reportError(error, 'recordingService:finalizeSoapNote');
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
    reportError(error, 'recordingService:deleteRecording');
    return false;
  }
};

