import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface EmbeddingResult {
    embedding: number[];
    model: string;
    usage: { prompt_tokens: number; total_tokens: number };
}

export class EmbeddingService {
    private openaiKey: string;

    constructor(openaiKey: string) {
        this.openaiKey = openaiKey;
    }

    async generateEmbedding(text: string): Promise<EmbeddingResult> {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small', // 1536 dimensions, cost-effective
                input: text,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Embedding failed: ${response.statusText}. ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return {
            embedding: data.data[0].embedding,
            model: data.model,
            usage: data.usage,
        };
    }

    async storeMemory(
        supabase: any,
        userId: string,
        content: string,
        memoryType: 'session_note' | 'patient_goal' | 'therapist_note' | 'conversation',
        metadata: Record<string, any> = {}
    ): Promise<string> {
        // Generate embedding
        const { embedding } = await this.generateEmbedding(content);

        // Store in agent_memory table
        const { data, error } = await supabase
            .from('agent_memory')
            .insert({
                user_id: userId,
                memory_type: memoryType,
                content,
                embedding,
                metadata,
            })
            .select('id')
            .single();

        if (error) throw error;
        return data.id;
    }

    async searchSimilarMemories(
        supabase: any,
        userId: string,
        query: string,
        memoryTypes: string[],
        limit: number = 5,
        similarityThreshold: number = 0.7
    ): Promise<any[]> {
        // Generate query embedding
        const { embedding } = await this.generateEmbedding(query);

        // Use pgvector similarity search
        const { data, error } = await supabase.rpc('search_agent_memory', {
            query_embedding: embedding,
            query_user_id: userId,
            query_memory_types: memoryTypes,
            match_threshold: similarityThreshold,
            match_count: limit,
        });

        if (error) throw error;
        return data || [];
    }
}
