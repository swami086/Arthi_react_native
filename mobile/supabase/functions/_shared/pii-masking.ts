
export class PIIMaskingService {
    // Regex Patterns
    private static readonly PHONE_PATTERN = /(\+?1?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
    private static readonly EMAIL_PATTERN = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
    private static readonly SSN_PATTERN = /\b(?!666|000|9\d{2})\d{3}[- ]?\d{2}[- ]?\d{4}\b/g;
    private static readonly NAME_PATTERN = /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g;
    private static readonly DATE_PATTERN = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g;
    private static readonly ADDRESS_PATTERN = /\b\d{1,5}\s+[a-zA-Z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)\b/gi;
    private static readonly ZIP_PATTERN = /\b\d{5}(?:-\d{4})?\b/g;
    private static readonly MRN_PATTERN = /\b(?:MRN|Medical Record|Record Number|Patient ID)[:\s#]*([A-Z0-9]{6,})\b/gi;
    private static readonly ACCOUNT_PATTERN = /\b(?:Account|Acct)[:\s#]*([A-Z0-9]{6,})\b/gi;

    private static instance: PIIMaskingService;

    private constructor() { }

    public static getInstance(): PIIMaskingService {
        if (!PIIMaskingService.instance) {
            PIIMaskingService.instance = new PIIMaskingService();
        }
        return PIIMaskingService.instance;
    }

    public maskText(text: string): string {
        if (!text || typeof text !== 'string') return text;
        let masked = text;
        masked = masked.replace(PIIMaskingService.PHONE_PATTERN, '[PHONE-REDACTED]');
        masked = masked.replace(PIIMaskingService.EMAIL_PATTERN, '[EMAIL-REDACTED]');
        masked = masked.replace(PIIMaskingService.SSN_PATTERN, '[SSN-REDACTED]');
        masked = masked.replace(PIIMaskingService.NAME_PATTERN, '[NAME-REDACTED]');
        masked = masked.replace(PIIMaskingService.DATE_PATTERN, '[DATE-REDACTED]');
        masked = masked.replace(PIIMaskingService.ADDRESS_PATTERN, '[ADDRESS-REDACTED]');
        masked = masked.replace(PIIMaskingService.ZIP_PATTERN, '[ZIP-REDACTED]');
        masked = masked.replace(PIIMaskingService.MRN_PATTERN, '[MRN-REDACTED]');
        masked = masked.replace(PIIMaskingService.ACCOUNT_PATTERN, '[ACCOUNT-REDACTED]');
        return masked;
    }

    public maskConversation(messages: any[]): any[] {
        if (!Array.isArray(messages)) return messages;
        return messages.map(msg => {
            // Deep copy to avoid mutating original if needed, assuming simple structure
            const newMsg = { ...msg };
            if (newMsg && typeof newMsg.content === 'string') {
                newMsg.content = this.maskText(newMsg.content);
            }
            return newMsg;
        });
    }

    public sanitizeForLogging(data: any): any {
        if (data === null || data === undefined) return data;
        if (typeof data !== 'object') {
            if (typeof data === 'string') {
                return this.maskText(data);
            }
            return data;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeForLogging(item));
        }

        const sanitized: any = {};
        const sensitiveFields = ['password', 'token', 'secret', 'ssn', 'credit_card'];

        for (const key of Object.keys(data)) {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = this.sanitizeForLogging(data[key]);
            }
        }
        return sanitized;
    }
}

export const piiMaskingService = PIIMaskingService.getInstance();
