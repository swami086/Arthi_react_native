import { createClient } from '../supabase/client';

export interface StreamOptions {
    onToken: (token: string) => void;
    onComplete?: (fullContent: string) => void;
    onError?: (error: any) => void;
}

/**
 * Service for handling streaming AI responses.
 */
export const streamingService = {
    /**
     * Stream a response from a Supabase Edge Function.
     */
    async streamEdgeFunction(
        functionName: string,
        body: Record<string, any>,
        options: StreamOptions
    ) {
        const supabase = createClient();

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,

                    },
                    body: JSON.stringify({
                        ...body,
                        stream: true
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Streaming failed: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    fullContent += chunk;
                    options.onToken(chunk);
                }
            }

            options.onComplete?.(fullContent);

        } catch (error) {
            console.error(`Streaming error from ${functionName}:`, error);
            options.onError?.(error);
        }
    }
};
