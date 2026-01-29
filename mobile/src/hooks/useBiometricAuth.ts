import { useState, useEffect, useCallback } from 'react';
import biometricAuthService, {
    BiometricType,
    BiometricSettings,
    BiometricAuthResult,
    BiometricAvailability,
    HighRiskAction,
} from '../services/biometricAuthService';

export interface UseBiometricAuthReturn {
    isAvailable: boolean;
    isEnrolled: boolean;
    biometricType: BiometricType;
    biometricDisplayName: string;
    isEnabled: boolean;
    settings: BiometricSettings | null;
    isLoading: boolean;
    error: string | null;
    authenticate: (reason: string) => Promise<BiometricAuthResult>;
    authenticateWithRetry: (reason: string, maxAttempts?: number) => Promise<BiometricAuthResult>;
    requireAuthForAction: (action: HighRiskAction, reason: string) => Promise<BiometricAuthResult>;
    updateSettings: (settings: Partial<BiometricSettings>) => Promise<void>;
    toggleBiometricAuth: (enabled: boolean) => Promise<void>;
    toggleAction: (action: HighRiskAction, enabled: boolean) => Promise<void>;
    isActionEnabled: (action: HighRiskAction) => boolean;
    refreshAvailability: () => Promise<void>;
    clearAuthTimeout: () => Promise<void>;
}

export function useBiometricAuth(): UseBiometricAuthReturn {
    const [availability, setAvailability] = useState<BiometricAvailability>({
        isAvailable: false,
        isEnrolled: false,
        biometricType: 'none',
        supportedTypes: [],
    });
    const [settings, setSettings] = useState<BiometricSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadInitialData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [availabilityResult, settingsResult] = await Promise.all([
                biometricAuthService.checkAvailability(),
                biometricAuthService.getSettings(),
            ]);

            setAvailability(availabilityResult);
            setSettings(settingsResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load biometric data';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const refreshAvailability = useCallback(async () => {
        try {
            const availabilityResult = await biometricAuthService.checkAvailability();
            setAvailability(availabilityResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh availability';
            setError(errorMessage);
        }
    }, []);

    const authenticate = useCallback(async (reason: string): Promise<BiometricAuthResult> => {
        setError(null);
        const result = await biometricAuthService.authenticate(reason);
        if (!result.success && result.error) {
            setError(result.error);
        }
        return result;
    }, []);

    const authenticateWithRetry = useCallback(
        async (reason: string, maxAttempts?: number): Promise<BiometricAuthResult> => {
            setError(null);
            const result = await biometricAuthService.authenticateWithRetry(reason, maxAttempts);
            if (!result.success && result.error) {
                setError(result.error);
            }
            return result;
        },
        []
    );

    const requireAuthForAction = useCallback(
        async (action: HighRiskAction, reason: string): Promise<BiometricAuthResult> => {
            setError(null);
            const result = await biometricAuthService.requireAuthForAction(action, reason);
            if (!result.success && result.error) {
                setError(result.error);
            }
            return result;
        },
        []
    );

    const updateSettings = useCallback(async (newSettings: Partial<BiometricSettings>) => {
        try {
            await biometricAuthService.updateSettings(newSettings);
            const updatedSettings = await biometricAuthService.getSettings();
            setSettings(updatedSettings);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const toggleBiometricAuth = useCallback(
        async (enabled: boolean) => {
            await updateSettings({ enabled });
        },
        [updateSettings]
    );

    const toggleAction = useCallback(
        async (action: HighRiskAction, enabled: boolean) => {
            try {
                await biometricAuthService.toggleAction(action, enabled);
                const updatedSettings = await biometricAuthService.getSettings();
                setSettings(updatedSettings);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to toggle action';
                setError(errorMessage);
                throw err;
            }
        },
        []
    );

    const isActionEnabled = useCallback(
        (action: HighRiskAction): boolean => {
            if (!settings) return false;
            return biometricAuthService.isActionEnabled(action, settings);
        },
        [settings]
    );

    const clearAuthTimeout = useCallback(async () => {
        await biometricAuthService.clearAuthTimeout();
    }, []);

    const biometricDisplayName = biometricAuthService.getBiometricDisplayName(
        availability.biometricType
    );

    return {
        isAvailable: availability.isAvailable,
        isEnrolled: availability.isEnrolled,
        biometricType: availability.biometricType,
        biometricDisplayName,
        isEnabled: settings?.enabled ?? false,
        settings,
        isLoading,
        error,
        authenticate,
        authenticateWithRetry,
        requireAuthForAction,
        updateSettings,
        toggleBiometricAuth,
        toggleAction,
        isActionEnabled,
        refreshAvailability,
        clearAuthTimeout,
    };
}

export default useBiometricAuth;
