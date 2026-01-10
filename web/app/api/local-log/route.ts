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

        // Define log file path in project root
        // process.cwd() should return the web directory. We want to write to project root or web root.
        // Let's write to relative 'browser.log' which will likely end up in web/browser.log
        const logDir = path.join(process.cwd(), '..'); // Go up to project root if running in 'web'
        const logFile = path.join(logDir, 'browser.log');

        // Format: [TIMESTAMP] [LEVEL] MESSAGE
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${typeof message === 'object' ? JSON.stringify(message) : message}\n`;

        // Append to file
        // We use synchronous append for simplicity in dev, or async.
        await fs.promises.appendFile(logFile, logEntry);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to write local log:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
