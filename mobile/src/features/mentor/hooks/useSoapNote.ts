import { useState, useCallback } from 'react';
import * as recordingService from '../../../api/recordingService';
import { supabase } from '../../../api/supabase';

export const useSoapNote = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [soapNote, setSoapNote] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSoapNote = useCallback(async (transcriptId: string, appointmentId: string) => {
    try {
      setIsGenerating(true);
      setError(null);

      const { data, error: funcError } = await supabase.functions.invoke('generate-soap-note', {
        body: { transcript_id: transcriptId, appointment_id: appointmentId }
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSoapNote(data.soapNote);
      setIsGenerating(false);

      return data.soapNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setIsGenerating(false);
      return null;
    }
  }, []);

  const updateSoapNote = useCallback(async (soapNoteId: string, updates: any) => {
    try {
      const updated = await recordingService.updateSoapNote(soapNoteId, updates);
      if (updated) {
        setSoapNote(updated);
      }
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    }
  }, []);

  const finalizeSoapNote = useCallback(async (soapNoteId: string) => {
    try {
      const success = await recordingService.finalizeSoapNote(soapNoteId);
      if (success && soapNote) {
        setSoapNote({ ...soapNote, is_finalized: true });
      }
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    }
  }, [soapNote]);

  return {
    generateSoapNote,
    updateSoapNote,
    finalizeSoapNote,
    soapNote,
    isGenerating,
    error,
  };
};
