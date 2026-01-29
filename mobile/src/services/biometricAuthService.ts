import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { reportError, reportInfo, reportWarning, getTraceId } from './rollbar';

export type BiometricType = 'face_id' | 'touch_id' | 'fingerprint' | 'iris' | 'none';

export type AuthenticationLevel = 'BIOMETRIC_STRONG' | 'BIOMETRIC_WEAK' | 'DEVICE_CREDENTIAL';

export interface BiometricCapabilities {
    isAvailable: boolean;
    biometricType: BiometricType;
    isEnrolled: boolean;
    securityLevel: AuthenticationLevel;
    supportedTypes: BiometricType[];
}

export interface BiometricSettings {
    enabled: boolean;
    requireForBooking: boolean;
    requireForSOAPApproval: boolean;
    requireForPayments: boolean;
    requireForDeletion: boolean;
    gracePeriodMinutes: number;
    maxRetries: number;
}

export interface AuthenticationResult {
    success: boolean;
    error?: string;
    errorCode?: string;
    warning?: string;
    retriesRemaining?: number;
}

export interface AuthenticationAttempt {
    timestamp: number;
    action: string;
    success: boolean;
    biometricType: BiometricType;
    errorCode?: string;
    userId?: string;
}

export type HighRiskAction = 'booking' | 'soap_approval' | 'payment' | 'deletion' | 'custom';

const STORAGE_KEYS = {
    BIOMETRIC_SETTINGS: '@biometric_settings',
    LAST_AUTH_TIMESTAMP: '@biometric_last_auth',
    AUTH_ATTEMPTS: '@biometric_auth_attempts',
    FAILED_ATTEMPTS_COUNT: '@biometric_failed_attempts',
};

const DEFAULT_SETTINGS: BiometricSettings = {
    enabled: true,
    requireForBooking: true,
    requireForSOAPApproval: true,
    requireForPayments: true,
    requireForDeletion: true,
    gracePeriodMinutes: 5,
    maxRetries: 3,
};

const MAX_FAILED_ATTEMPTS_ALERT = 5;
const FAILED_ATTEMPTS_RESET_HOURS = 24;

let LocalAuthentication: typeof import('expo-local-authentication') | null = null;

async function getLocalAuthentication() {
    if (!LocalAuthentication) {
        try {
            LocalAuthentication = await import('expo-local-authentication');
        } catch (error) {
            reportError(error, 'BiometricAuthService:getLocalAuthentication', {
                message: 'Failed to load expo-local-authentication',
            });
            return null;
        }
    }
    return LocalAuthentication;
}

function mapAuthenticationType(type: number): BiometricType {
    const LA = LocalAuthentication;
    if (!LA) return 'none';

    switch (type) {
        case LA.AuthenticationType.FACIAL_RECOGNITION:
            return Platform.OS === 'ios' ? 'face_id' : 'face_id';
        case LA.AuthenticationType.FINGERPRINT:
            return Platform.OS === 'ios' ? 'touch_id' : 'fingerprint';
        case LA.AuthenticationType.IRIS:
            return 'iris';
        default:
            return 'none';
    }
}

function getBiometricDisplayName(type: BiometricType): string {
    switch (type) {
        case 'face_id':
            return 'Face ID';
        case 'touch_id':
            return 'Touch ID';
        case 'fingerprint':
            return 'Fingerprint';
        case 'iris':
            return 'Iris';
        default:
            return 'Biometric';
    }
}

export class BiometricAuthService {
    private static instance: BiometricAuthService;
    private settings: BiometricSettings = DEFAULT_SETTINGS;
    private lastAuthTimestamp: number = 0;
    private failedAttemptsCount: number = 0;
    private failedAttemptsResetTime: number = 0;
    private currentRetryCount: number = 0;
    private isInitialized: boolean = false;

    private constructor() {}

    static getInstance(): BiometricAuthService {
        if (!BiometricAuthService.instance) {
            BiometricAuthService.instance = new BiometricAuthService();
        }
        return BiometricAuthService.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            await this.loadSettings();
            await this.loadFailedAttempts();
            this.isInitialized = true;
            reportInfo('BiometricAuthService initialized', 'BiometricAuthService:initialize');
        } catch (error) {
            reportError(error, 'BiometricAuthService:initialize');
        }
    }

    private async loadSettings(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_SETTINGS);
            if (stored) {
                this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }

            const lastAuth = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AUTH_TIMESTAMP);
            if (lastAuth) {
                this.lastAuthTimestamp = parseInt(lastAuth, 10);
            }
        } catch (error) {
            reportError(error, 'BiometricAuthService:loadSettings');
        }
    }

    private async loadFailedAttempts(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS_COUNT);
            if (stored) {
                const data = JSON.parse(stored);
                const resetTime = data.resetTime || 0;
                const now = Date.now();

                if (now - resetTime > FAILED_ATTEMPTS_RESET_HOURS * 60 * 60 * 1000) {
                    this.failedAttemptsCount = 0;
                    this.failedAttemptsResetTime = now;
                    await this.saveFailedAttempts();
                } else {
                    this.failedAttemptsCount = data.count || 0;
                    this.failedAttemptsResetTime = resetTime;
                }
            }
        } catch (error) {
            reportError(error, 'BiometricAuthService:loadFailedAttempts');
        }
    }

    private async saveFailedAttempts(): Promise<void> {
        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.FAILED_ATTEMPTS_COUNT,
                JSON.stringify({
                    count: this.failedAttemptsCount,
                    resetTime: this.failedAttemptsResetTime,
                })
            );
        } catch (error) {
            reportError(error, 'BiometricAuthService:saveFailedAttempts');
        }
    }

    async getCapabilities(): Promise<BiometricCapabilities> {
        const LA = await getLocalAuthentication();

        if (!LA) {
            return {
                isAvailable: false,
                biometricType: 'none',
                isEnrolled: false,
                securityLevel: 'DEVICE_CREDENTIAL',
                supportedTypes: [],
            };
        }

        try {
            const hasHardware = await LA.hasHardwareAsync();
            const isEnrolled = await LA.isEnrolledAsync();
            const supportedTypes = await LA.supportedAuthenticationTypesAsync();
            const securityLevel = await LA.getEnrolledLevelAsync();

            const mappedTypes = supportedTypes.map(mapAuthenticationType);
            const primaryType = mappedTypes.length > 0 ? mappedTypes[0] : 'none';

            let authLevel: AuthenticationLevel = 'DEVICE_CREDENTIAL';
            if (securityLevel === LA.SecurityLevel.BIOMETRIC_STRONG) {
                authLevel = 'BIOMETRIC_STRONG';
            } else if (securityLevel === LA.SecurityLevel.BIOMETRIC_WEAK) {
                authLevel = 'BIOMETRIC_WEAK';
            }

            return {
                isAvailable: hasHardware,
                biometricType: primaryType,
                isEnrolled,
                securityLevel: authLevel,
                supportedTypes: mappedTypes,
            };
        } catch (error) {
            reportError(error, 'BiometricAuthService:getCapabilities');
            return {
                isAvailable: false,
                biometricType: 'none',
                isEnrolled: false,
                securityLevel: 'DEVICE_CREDENTIAL',
                supportedTypes: [],
            };
        }
    }

    async authenticate(
        reason: string,
        options?: {
            action?: HighRiskAction;
            userId?: string;
            fallbackEnabled?: boolean;
            disableDeviceFallback?: boolean;
        }
    ): Promise<AuthenticationResult> {
        const LA = await getLocalAuthentication();

        if (!LA) {
            return {
                success: false,
                error: 'Biometric authentication is not available on this device',
                errorCode: 'NOT_AVAILABLE',
            };
        }

        const capabilities = await this.getCapabilities();

        if (!capabilities.isAvailable) {
            reportInfo('Biometric hardware not available', 'BiometricAuthService:authenticate', {
                action: options?.action,
            });
            return {
                success: false,
                error: 'Biometric authentication is not available on this device',
                errorCode: 'NOT_AVAILABLE',
            };
        }

        if (!capabilities.isEnrolled) {
            reportInfo('No biometrics enrolled', 'BiometricAuthService:authenticate', {
                action: options?.action,
            });
            return {
                success: false,
                error: `No ${getBiometricDisplayName(capabilities.biometricType)} enrolled. Please set up biometrics in your device settings.`,
                errorCode: 'NOT_ENROLLED',
            };
        }

        try {
            const result = await LA.authenticateAsync({
                promptMessage: reason,
                fallbackLabel: options?.fallbackEnabled !== false ? 'Use password' : undefined,
                disableDeviceFallback: options?.disableDeviceFallback ?? false,
                cancelLabel: 'Cancel',
            });

            if (result.success) {
                const attempt: AuthenticationAttempt = {
                    timestamp: Date.now(),
                    action: options?.action || 'custom',
                    success: true,
                    biometricType: capabilities.biometricType,
                    userId: options?.userId,
                };
                await this.logAuthenticationAttempt(attempt);

                this.lastAuthTimestamp = Date.now();
                await AsyncStorage.setItem(
                    STORAGE_KEYS.LAST_AUTH_TIMESTAMP,
                    this.lastAuthTimestamp.toString()
                );
                this.currentRetryCount = 0;

                reportInfo('Biometric authentication successful', 'BiometricAuthService:authenticate', {
                    action: options?.action,
                    biometricType: capabilities.biometricType,
                    trace_id: getTraceId(),
                });

                return { success: true };
            }

            const errorCode = result.error;
            const attempt: AuthenticationAttempt = {
                timestamp: Date.now(),
                action: options?.action || 'custom',
                success: false,
                biometricType: capabilities.biometricType,
                errorCode,
                userId: options?.userId,
            };
            await this.logAuthenticationAttempt(attempt);

            this.currentRetryCount++;
            this.failedAttemptsCount++;
            await this.saveFailedAttempts();

            if (this.failedAttemptsCount >= MAX_FAILED_ATTEMPTS_ALERT) {
                reportWarning(
                    `Multiple failed biometric attempts detected: ${this.failedAttemptsCount}`,
                    'BiometricAuthService:authenticate',
                    {
                        userId: options?.userId,
                        action: options?.action,
                        trace_id: getTraceId(),
                    }
                );
            }

            const retriesRemaining = this.settings.maxRetries - this.currentRetryCount;

            let errorMessage = 'Authentication failed';
            if (errorCode === 'user_cancel') {
                errorMessage = 'Authentication cancelled';
            } else if (errorCode === 'user_fallback') {
                errorMessage = 'User chose password fallback';
            } else if (errorCode === 'lockout') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (errorCode === 'lockout_permanent') {
                errorMessage = 'Biometric authentication is locked. Please use your device passcode.';
            }

            reportInfo('Biometric authentication failed', 'BiometricAuthService:authenticate', {
                action: options?.action,
                error: errorCode,
                retriesRemaining,
                trace_id: getTraceId(),
            });

            return {
                success: false,
                error: errorMessage,
                errorCode,
                retriesRemaining: retriesRemaining > 0 ? retriesRemaining : 0,
            };
        } catch (error) {
            reportError(error, 'BiometricAuthService:authenticate', {
                action: options?.action,
            });
            return {
                success: false,
                error: 'An unexpected error occurred during authentication',
                errorCode: 'UNKNOWN_ERROR',
            };
        }
    }

    async authenticateForAction(
        action: HighRiskAction,
        userId?: string
    ): Promise<AuthenticationResult> {
        await this.initialize();

        if (!this.settings.enabled) {
            return { success: true };
        }

        const shouldRequire = this.shouldRequireAuthForAction(action);
        if (!shouldRequire) {
            return { success: true };
        }

        if (this.isWithinGracePeriod()) {
            reportInfo('Within grace period, skipping biometric', 'BiometricAuthService:authenticateForAction', {
                action,
                lastAuth: this.lastAuthTimestamp,
                gracePeriod: this.settings.gracePeriodMinutes,
            });
            return { success: true };
        }

        const capabilities = await this.getCapabilities();
        const biometricName = getBiometricDisplayName(capabilities.biometricType);

        const reasonMap: Record<HighRiskAction, string> = {
            booking: `Confirm with ${biometricName} to book this appointment`,
            soap_approval: `Confirm with ${biometricName} to approve SOAP notes`,
            payment: `Confirm with ${biometricName} to process payment`,
            deletion: `Confirm with ${biometricName} to delete this data`,
            custom: `Confirm with ${biometricName} to continue`,
        };

        return this.authenticate(reasonMap[action], {
            action,
            userId,
            fallbackEnabled: true,
        });
    }

    private shouldRequireAuthForAction(action: HighRiskAction): boolean {
        switch (action) {
            case 'booking':
                return this.settings.requireForBooking;
            case 'soap_approval':
                return this.settings.requireForSOAPApproval;
            case 'payment':
                return this.settings.requireForPayments;
            case 'deletion':
                return this.settings.requireForDeletion;
            default:
                return true;
        }
    }

    private isWithinGracePeriod(): boolean {
        if (this.settings.gracePeriodMinutes <= 0) return false;
        const gracePeriodMs = this.settings.gracePeriodMinutes * 60 * 1000;
        return Date.now() - this.lastAuthTimestamp < gracePeriodMs;
    }

    private async logAuthenticationAttempt(attempt: AuthenticationAttempt): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_ATTEMPTS);
            let attempts: AuthenticationAttempt[] = stored ? JSON.parse(stored) : [];

            attempts.push(attempt);

            if (attempts.length > 100) {
                attempts = attempts.slice(-100);
            }

            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_ATTEMPTS, JSON.stringify(attempts));
        } catch (error) {
            reportError(error, 'BiometricAuthService:logAuthenticationAttempt');
        }
    }

    async getAuthenticationHistory(limit: number = 20): Promise<AuthenticationAttempt[]> {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_ATTEMPTS);
            if (!stored) return [];

            const attempts: AuthenticationAttempt[] = JSON.parse(stored);
            return attempts.slice(-limit).reverse();
        } catch (error) {
            reportError(error, 'BiometricAuthService:getAuthenticationHistory');
            return [];
        }
    }

    getSettings(): BiometricSettings {
        return { ...this.settings };
    }

    async updateSettings(newSettings: Partial<BiometricSettings>): Promise<void> {
        this.settings = { ...this.settings, ...newSettings };

        try {
            await AsyncStorage.setItem(
                STORAGE_KEYS.BIOMETRIC_SETTINGS,
                JSON.stringify(this.settings)
            );

            reportInfo('Biometric settings updated', 'BiometricAuthService:updateSettings', {
                settings: this.settings,
            });
        } catch (error) {
            reportError(error, 'BiometricAuthService:updateSettings');
            throw error;
        }
    }

    async resetSettings(): Promise<void> {
        this.settings = { ...DEFAULT_SETTINGS };
        this.lastAuthTimestamp = 0;
        this.failedAttemptsCount = 0;
        this.currentRetryCount = 0;

        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.BIOMETRIC_SETTINGS,
                STORAGE_KEYS.LAST_AUTH_TIMESTAMP,
                STORAGE_KEYS.AUTH_ATTEMPTS,
                STORAGE_KEYS.FAILED_ATTEMPTS_COUNT,
            ]);

            reportInfo('Biometric settings reset', 'BiometricAuthService:resetSettings');
        } catch (error) {
            reportError(error, 'BiometricAuthService:resetSettings');
            throw error;
        }
    }

    resetRetryCount(): void {
        this.currentRetryCount = 0;
    }

    getRetryCount(): number {
        return this.currentRetryCount;
    }

    getMaxRetries(): number {
        return this.settings.maxRetries;
    }

    clearGracePeriod(): void {
        this.lastAuthTimestamp = 0;
    }
}

export const biometricAuthService = BiometricAuthService.getInstance();

export async function authenticateWithBiometric(reason: string): Promise<boolean> {
    const result = await biometricAuthService.authenticate(reason);
    return result.success;
}

export async function checkBiometricAvailability(): Promise<BiometricCapabilities> {
    return biometricAuthService.getCapabilities();
}

export { getBiometricDisplayName };
