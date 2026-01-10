import { NextRequest, NextResponse } from 'next/server';
import { reportError, startSpan, endSpan, generateUUID, withRollbarTrace } from './rollbar-utils';
import { ZodSchema } from 'zod';

type ApiHandler<T = any> = (
    req: NextRequest,
    params: any
) => Promise<NextResponse<T> | Response>;

export function withApiErrorHandling(
    handler: ApiHandler,
    _schema?: ZodSchema<any>
): ApiHandler {
    return async (req: NextRequest, params: any) => {
        const requestId = req.headers.get('x-request-id') || generateUUID();
        const spanId = generateUUID();
        const path = req.nextUrl.pathname;
        const method = req.method;

        // Start tracing
        const traceHeaders = {
            'X-Rollbar-Trace-Id': requestId,
            'X-Rollbar-Span-Id': spanId,
        };

        startSpan(`api:${method}:${path}`, { request_id: requestId, span_id: spanId });

        try {
            // Execute handler
            const response = await handler(req, params);

            // Add trace headers to response
            const newHeaders = new Headers(response.headers);
            Object.entries(traceHeaders).forEach(([key, value]) => {
                newHeaders.set(key, value);
            });

            // Clone response with new headers
            // Note: This matches the ResponseInit signature more closely
            const newResponse = new NextResponse(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: newHeaders,
            });

            endSpan();
            return newResponse;

        } catch (error: any) {
            endSpan();

            // Handle Next Redirects
            if (error.message === 'NEXT_REDIRECT') {
                throw error;
            }

            // Report to Rollbar
            reportError(error, `api.error:${method}:${path}`, {
                request_id: requestId,
                url: req.url,
                method: req.method,
                user_agent: req.headers.get('user-agent'),
            });

            // Return standardized error response
            return NextResponse.json(
                {
                    success: false,
                    error: 'Internal Server Error',
                    requestId,
                },
                { status: 500 }
            );
        }
    };
}
