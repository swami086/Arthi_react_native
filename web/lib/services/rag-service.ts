import { createClient } from '../supabase/client';

export interface MemoryMetadata {
    patientId?: string;
    appointmentId?: string;
    therapistId?: string;
    type: 'session_note' | 'therapist_note' | 'patient_goal' | 'wellness_check' | 'mood_entry';
}

/**
 * Service for interacting with the RAG (Retrieval-Augmented Generation) system.
 */
export const ragService = {
    /**
     * Retrieve relevant context for a query using semantic search.
     */
    async retrieveContext(query: string, userId: string, limit = 5) {
        const supabase = createClient();

        const { data, error } = await supabase.functions.invoke('rag-retrieve', {
            body: {
                query,
                userId,
                limit,
                memoryTypes: ['session_note', 'therapist_note', 'patient_goal']
            }
        });

        if (error) {
            console.error('RAG Retrieval failed:', error);
            throw error;
        }

        return data;
    },

    async storeMemory(content: string, userId: string, metadata: MemoryMetadata) {
        const supabase = createClient();

        // Call the rag-ingest edge function to handle embeddings and insertion
        const { data, error } = await supabase.functions.invoke('rag-ingest', {
            body: {
                content,
                userId,
                memoryType: metadata.type,
                metadata: {
                    ...metadata,
                    source: 'web'
                }
            }
        });

        if (error || !data?.success) {
            console.error('Failed to store memory via RAG ingest:', error || data?.error);
            throw error || new Error(data?.error || 'Unknown ingest error');
        }

        return data.record;
    },


    async storeBatchMemories(memories: { content: string, metadata: MemoryMetadata }[], userId: string) {
        const supabase = createClient();

        const { data, error } = await supabase.functions.invoke('rag-ingest', {
            body: {
                userId,
                memories: memories.map(m => ({
                    content: m.content,
                    memoryType: m.metadata.type,
                    metadata: m.metadata
                }))
            }
        });

        if (error || !data?.success) {
            console.error('Batch RAG ingest failed:', error || data?.error);
            throw error || new Error(data?.error || 'Batch ingest failed');
        }

        return data.records;
    },


    /**
     * Update an existing memory.
     */
    async updateMemory(id: string, content: string) {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('agent_memory')
            .update({ content })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a memory.
     */
    async deleteMemory(id: string) {
        const supabase = createClient();
        const { error } = await supabase
            .from('agent_memory')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
