import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { reportError, reportInfo, reportWarning } from './rollbar';

const BIOMETRIC_SETTINGS_KEY = '@biometric_settings';
const LAST_AUTH_TIME_KEY = '@biometric_last_auth_time';
const AUTH_FAILURE_COUNT_KEY = '@biometric_failure_count';

const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MINUTES = 5;
const FAILURE_ALERT_THRESHOLD = 5;

export type BiometricType = 'face_id' | 'touch_id' | 'fingerprint' | 'iris' | 'none';

export type HighRiskAction =
    | 'booking_appointment'
    | 'approving_soap_note'
    | 'processing_payment'
    | 'deleting_data'
    | 'exporting_data';

export interface BiometricSettings {
    enabled: boolean;
    timeoutMinutes: number;
    enabledActions: HighRiskAction[];
}

export interface BiometricAuthResult {
    success: boolean;
    error?: string;
    errorCode?: string;
    usedFallback?: boolean;
    biometricType?: BiometricType;
}

export interface BiometricAvailability {
    isAvailable: boolean;
    isEnrolled: boolean;
    biometricType: BiometricType;
    supportedTypes: LocalAuthentication.AuthenticationType[];
}

const DEFAULT_SETTINGS: BiometricSettings = {
    enabled: true,
    timeoutMinutes: DEFAULT_TIMEOUT_MINUTES,
    enabledActions: [
        'booking_appointment',
        'approving_soap_note',
        'processing_payment',
        'deleting_data',
    ],
};

class BiometricAuthService {
    private failureCount: number = 0;

    async checkAvailability(): Promise<BiometricAvailability> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

            const biometricType = this.determineBiometricType(supportedTypes);

            reportInfo('Biometric availability checked', 'BiometricAuth', {
                hasHardware,
                isEnrolled,
                supportedTypes,
                biometricType,
                platform: Platform.OS,
            });

            return {
                isAvailable: hasHardware,
                isEnrolled,
                biometricType,
                supportedTypes,
            };
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'checkAvailability' });
            return {
                isAvailable: false,
                isEnrolled: false,
                biometricType: 'none',
                supportedTypes: [],
            };
        }
    }

    private determineBiometricType(
        supportedTypes: LocalAuthentication.AuthenticationType[]
    ): BiometricType {
        if (supportedTypes.length === 0) {
            return 'none';
        }

        if (Platform.OS === 'ios') {
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                return 'face_id';
            }
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                return 'touch_id';
            }
        }

        if (Platform.OS === 'android') {
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                return 'face_id';
            }
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                return 'fingerprint';
            }
            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                return 'iris';
            }
        }

        return 'none';
    }

    getBiometricDisplayName(type: BiometricType): string {
        switch (type) {
            case 'face_id':
                return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
            case 'touch_id':
                return 'Touch ID';
            case 'fingerprint':
                return 'Fingerprint';
            case 'iris':
                return 'Iris Scanner';
            default:
                return 'Biometric';
        }
    }

    async authenticate(
        reason: string,
        options?: {
            disableDeviceFallback?: boolean;
            cancelLabel?: string;
            fallbackLabel?: string;
        }
    ): Promise<BiometricAuthResult> {
        const availability = await this.checkAvailability();

        if (!availability.isAvailable) {
            reportWarning('Biometric hardware not available', 'BiometricAuth');
            return {
                success: false,
                error: 'Biometric authentication is not available on this device',
                errorCode: 'NOT_AVAILABLE',
            };
        }

        if (!availability.isEnrolled) {
            reportWarning('No biometrics enrolled', 'BiometricAuth');
            return {
                success: false,
                error: 'No biometrics enrolled. Please set up biometrics in your device settings.',
                errorCode: 'NOT_ENROLLED',
            };
        }

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: reason,
                cancelLabel: options?.cancelLabel || 'Cancel',
                fallbackLabel: options?.fallbackLabel || 'Use Password',
                disableDeviceFallback: options?.disableDeviceFallback ?? false,
            });

            if (result.success) {
                await this.resetFailureCount();
                await this.updateLastAuthTime();

                reportInfo('Biometric authentication successful', 'BiometricAuth', {
                    biometricType: availability.biometricType,
                    reason,
                });

                return {
                    success: true,
                    biometricType: availability.biometricType,
                };
            }

            await this.incrementFailureCount();

            const errorCode = 'error' in result ? result.error : 'unknown';
            const errorMessage = this.getErrorMessage(errorCode);
            reportWarning('Biometric authentication failed', 'BiometricAuth', {
                error: errorCode,
                reason,
                failureCount: this.failureCount,
            });

            return {
                success: false,
                error: errorMessage,
                errorCode: errorCode,
            };
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'authenticate', reason });
            return {
                success: false,
                error: 'An unexpected error occurred during authentication',
                errorCode: 'UNKNOWN_ERROR',
            };
        }
    }

    async authenticateWithRetry(
        reason: string,
        maxAttempts: number = MAX_RETRY_ATTEMPTS
    ): Promise<BiometricAuthResult> {
        let attempts = 0;
        let lastResult: BiometricAuthResult = {
            success: false,
            error: 'Authentication not attempted',
        };

        while (attempts < maxAttempts) {
            attempts++;
            lastResult = await this.authenticate(reason);

            if (lastResult.success) {
                return lastResult;
            }

            if (
                lastResult.errorCode === 'user_cancel' ||
                lastResult.errorCode === 'system_cancel' ||
                lastResult.errorCode === 'NOT_AVAILABLE' ||
                lastResult.errorCode === 'NOT_ENROLLED'
            ) {
                break;
            }

            reportInfo(`Biometric auth attempt ${attempts} failed, retrying...`, 'BiometricAuth', {
                errorCode: lastResult.errorCode,
                remainingAttempts: maxAttempts - attempts,
            });
        }

        return lastResult;
    }

    private getErrorMessage(errorCode: string): string {
        switch (errorCode) {
            case 'user_cancel':
                return 'Authentication was cancelled';
            case 'system_cancel':
                return 'Authentication was cancelled by the system';
            case 'not_enrolled':
                return 'No biometrics enrolled on this device';
            case 'lockout':
                return 'Too many failed attempts. Please try again later.';
            case 'lockout_permanent':
                return 'Biometric authentication is locked. Please use your device passcode.';
            case 'user_fallback':
                return 'User chose to use fallback authentication';
            default:
                return 'Authentication failed. Please try again.';
        }
    }

    async getSettings(): Promise<BiometricSettings> {
        try {
            const stored = await AsyncStorage.getItem(BIOMETRIC_SETTINGS_KEY);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
            return DEFAULT_SETTINGS;
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'getSettings' });
            return DEFAULT_SETTINGS;
        }
    }

    async updateSettings(settings: Partial<BiometricSettings>): Promise<void> {
        try {
            const current = await this.getSettings();
            const updated = { ...current, ...settings };
            await AsyncStorage.setItem(BIOMETRIC_SETTINGS_KEY, JSON.stringify(updated));

            reportInfo('Biometric settings updated', 'BiometricAuth', {
                enabled: updated.enabled,
                timeoutMinutes: updated.timeoutMinutes,
                enabledActionsCount: updated.enabledActions.length,
            });
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'updateSettings' });
            throw error;
        }
    }

    async shouldRequireAuth(action?: HighRiskAction): Promise<boolean> {
        try {
            const settings = await this.getSettings();

            if (!settings.enabled) {
                return false;
            }

            if (action && !settings.enabledActions.includes(action)) {
                return false;
            }

            const lastAuthTime = await this.getLastAuthTime();
            if (lastAuthTime) {
                const elapsedMinutes = (Date.now() - lastAuthTime) / (1000 * 60);
                if (elapsedMinutes < settings.timeoutMinutes) {
                    reportInfo('Auth not required - within timeout window', 'BiometricAuth', {
                        elapsedMinutes,
                        timeoutMinutes: settings.timeoutMinutes,
                    });
                    return false;
                }
            }

            return true;
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'shouldRequireAuth' });
            return true;
        }
    }

    async requireAuthForAction(
        action: HighRiskAction,
        reason: string
    ): Promise<BiometricAuthResult> {
        const shouldAuth = await this.shouldRequireAuth(action);

        if (!shouldAuth) {
            return { success: true };
        }

        return this.authenticateWithRetry(reason);
    }

    private async getLastAuthTime(): Promise<number | null> {
        try {
            const stored = await AsyncStorage.getItem(LAST_AUTH_TIME_KEY);
            return stored ? parseInt(stored, 10) : null;
        } catch {
            return null;
        }
    }

    private async updateLastAuthTime(): Promise<void> {
        try {
            await AsyncStorage.setItem(LAST_AUTH_TIME_KEY, Date.now().toString());
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'updateLastAuthTime' });
        }
    }

    async clearAuthTimeout(): Promise<void> {
        try {
            await AsyncStorage.removeItem(LAST_AUTH_TIME_KEY);
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'clearAuthTimeout' });
        }
    }

    private async incrementFailureCount(): Promise<void> {
        try {
            const stored = await AsyncStorage.getItem(AUTH_FAILURE_COUNT_KEY);
            this.failureCount = stored ? parseInt(stored, 10) + 1 : 1;
            await AsyncStorage.setItem(AUTH_FAILURE_COUNT_KEY, this.failureCount.toString());

            if (this.failureCount >= FAILURE_ALERT_THRESHOLD) {
                reportWarning('Multiple biometric auth failures detected - potential attack', 'BiometricAuth', {
                    failureCount: this.failureCount,
                    threshold: FAILURE_ALERT_THRESHOLD,
                });
            }
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'incrementFailureCount' });
        }
    }

    private async resetFailureCount(): Promise<void> {
        try {
            this.failureCount = 0;
            await AsyncStorage.removeItem(AUTH_FAILURE_COUNT_KEY);
        } catch (error) {
            reportError(error, 'BiometricAuth', { action: 'resetFailureCount' });
        }
    }

    async getFailureCount(): Promise<number> {
        try {
            const stored = await AsyncStorage.getItem(AUTH_FAILURE_COUNT_KEY);
            return stored ? parseInt(stored, 10) : 0;
        } catch {
            return 0;
        }
    }

    isActionEnabled(action: HighRiskAction, settings: BiometricSettings): boolean {
        return settings.enabled && settings.enabledActions.includes(action);
    }

    async toggleAction(action: HighRiskAction, enabled: boolean): Promise<void> {
        const settings = await this.getSettings();
        let enabledActions = [...settings.enabledActions];

        if (enabled && !enabledActions.includes(action)) {
            enabledActions.push(action);
        } else if (!enabled) {
            enabledActions = enabledActions.filter((a) => a !== action);
        }

        await this.updateSettings({ enabledActions });
    }
}

export const biometricAuthService = new BiometricAuthService();
export default biometricAuthService;
