import { reportError, reportInfo, reportWarning, getTraceId } from './rollbar-utils';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface LogContext {
    [key: string]: any;
}

class Logger {
    private static instance: Logger;
    private context: LogContext = {};

    private constructor() { }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public setContext(context: LogContext) {
        this.context = { ...this.context, ...context };
    }

    public clearContext() {
        this.context = {};
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString();
        const traceId = getTraceId() || 'no-trace';
        return {
            timestamp,
            level,
            message,
            traceId,
            ...this.context,
            ...context,
        };
    }

    public debug(message: string, context?: LogContext) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, this.formatMessage(LogLevel.DEBUG, message, context));
        }
    }

    public info(message: string, context?: LogContext) {
        if (process.env.NODE_ENV === 'development') {
            console.info(`[INFO] ${message}`, this.formatMessage(LogLevel.INFO, message, context));
        }
        reportInfo(message, 'logger', { ...this.context, ...context });
    }

    public warn(message: string, context?: LogContext) {
        if (process.env.NODE_ENV === 'development') {
            console.warn(`[WARN] ${message}`, this.formatMessage(LogLevel.WARN, message, context));
        }
        reportWarning(message, 'logger', { ...this.context, ...context });
    }

    public error(message: string, error?: any, context?: LogContext) {
        if (process.env.NODE_ENV === 'development') {
            console.error(`[ERROR] ${message}`, error, this.formatMessage(LogLevel.ERROR, message, context));
        }
        reportError(error instanceof Error ? error : new Error(message), 'logger', {
            message, // include custom message since Rollbar uses error.message
            ...this.context,
            ...context
        });
    }
}

export const logger = Logger.getInstance();
