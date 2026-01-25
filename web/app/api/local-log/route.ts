import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Log endpoint only available in development' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { level = 'info', message, timestamp = new Date().toISOString() } = body;

        // Write to browser.log. Prefer LOCAL_LOG_DIR (align with local-logs MCP logsDir), else project root.
        const logDir = process.env.LOCAL_LOG_DIR
            ? path.resolve(process.env.LOCAL_LOG_DIR)
            : path.join(process.cwd(), '..');
        const logFile = path.join(logDir, 'browser.log');

        await fs.promises.mkdir(logDir, { recursive: true }).catch(() => {});

        // Format: [TIMESTAMP] [LEVEL] MESSAGE
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${typeof message === 'object' ? JSON.stringify(message) : message}\n`;

        await fs.promises.appendFile(logFile, logEntry);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to write local log:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
