import { startSpan, endSpan, reportError, reportWarning, endTimer, startTimer, getTraceId, resetTraceId } from './rollbar-utils';
import { ZodSchema } from 'zod';

export type ServerActionResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    validationErrors?: Record<string, string[]>;
};

/**
 * Higher-Order Function to wrap server actions with error handling, strict typing, and tracing.
 */
export function withErrorHandling<T, Args extends any[]>(
    actionName: string,
    action: (...args: Args) => Promise<T | ServerActionResponse<T>>,
    schema?: ZodSchema<any>
) {
    return async (...args: Args): Promise<ServerActionResponse<T>> => {
        const traceId = resetTraceId();
        startTimer(actionName);
        startSpan(actionName);

        try {
            // Input Validation
            if (schema && args.length > 0) {
                const validationResult = schema.safeParse(args[0]);
                if (!validationResult.success) {
                    const validationErrors = validationResult.error.flatten().fieldErrors;

                    reportWarning('Validation failed', actionName, {
                        errors: validationErrors,
                        trace_id: traceId
                    });

                    endSpan();
                    return {
                        success: false,
                        error: 'Invalid input provided',
                        validationErrors: validationErrors as Record<string, string[]>
                    };
                }
            }

            // Execute the action
            const result = await action(...args);

            endTimer(actionName, 'server_action', { success: true });
            endSpan();

            // If the action already returned a structured response, allow it to pass through
            // Check if it looks like a ServerActionResponse
            if (result && typeof result === 'object' && 'success' in result) {
                return result as ServerActionResponse<T>;
            }

            return { success: true, data: result as T };

        } catch (error: any) {
            endSpan();

            // Handle Next.js Redirects (which throws errors)
            if (
                error?.digest?.startsWith('NEXT_REDIRECT') ||
                error?.message === 'NEXT_REDIRECT' ||
                (typeof error?.message === 'string' && error.message.includes('NEXT_REDIRECT'))
            ) {
                throw error;
            }

            reportError(error, actionName, { trace_id: traceId, args: JSON.stringify(args) });

            return {
                success: false,
                error: error.message || 'An unexpected error occurred. Please try again later.'
            };
        }
    };
}
