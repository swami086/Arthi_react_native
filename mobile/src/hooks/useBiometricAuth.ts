import { useState, useEffect, useCallback, useRef } from 'react';
import {
    biometricAuthService,
    BiometricCapabilities,
    BiometricSettings,
    AuthenticationResult,
    HighRiskAction,
} from '../services/biometricAuthService';
import { reportError, reportInfo } from '../services/rollbar';

interface UseBiometricAuthState {
    isLoading: boolean;
    capabilities: BiometricCapabilities | null;
    settings: BiometricSettings | null;
    isAvailable: boolean;
    isEnrolled: boolean;
    biometricType: string;
    error: string | null;
}

interface UseBiometricAuthReturn extends UseBiometricAuthState {
    authenticate: (reason: string) => Promise<AuthenticationResult>;
    authenticateForAction: (action: HighRiskAction) => Promise<AuthenticationResult>;
    updateSettings: (settings: Partial<BiometricSettings>) => Promise<void>;
    resetSettings: () => Promise<void>;
    refresh: () => Promise<void>;
    clearError: () => void;
}

export function useBiometricAuth(userId?: string): UseBiometricAuthReturn {
    const [state, setState] = useState<UseBiometricAuthState>({
        isLoading: true,
        capabilities: null,
        settings: null,
        isAvailable: false,
        isEnrolled: false,
        biometricType: 'none',
        error: null,
    });

    const isMounted = useRef(true);

    const loadCapabilitiesAndSettings = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            await biometricAuthService.initialize();
            const capabilities = await biometricAuthService.getCapabilities();
            const settings = biometricAuthService.getSettings();

            if (isMounted.current) {
                setState({
                    isLoading: false,
                    capabilities,
                    settings,
                    isAvailable: capabilities.isAvailable,
                    isEnrolled: capabilities.isEnrolled,
                    biometricType: capabilities.biometricType,
                    error: null,
                });
            }
        } catch (error) {
            reportError(error, 'useBiometricAuth:loadCapabilitiesAndSettings');
            if (isMounted.current) {
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: 'Failed to load biometric capabilities',
                }));
            }
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        loadCapabilitiesAndSettings();

        return () => {
            isMounted.current = false;
        };
    }, [loadCapabilitiesAndSettings]);

    const authenticate = useCallback(
        async (reason: string): Promise<AuthenticationResult> => {
            try {
                setState(prev => ({ ...prev, error: null }));
                const result = await biometricAuthService.authenticate(reason, {
                    userId,
                    fallbackEnabled: true,
                });

                if (!result.success && result.error) {
                    if (isMounted.current) {
                        setState(prev => ({ ...prev, error: result.error || null }));
                    }
                }

                return result;
            } catch (error) {
                reportError(error, 'useBiometricAuth:authenticate');
                const errorMessage = 'Authentication failed unexpectedly';
                if (isMounted.current) {
                    setState(prev => ({ ...prev, error: errorMessage }));
                }
                return {
                    success: false,
                    error: errorMessage,
                    errorCode: 'HOOK_ERROR',
                };
            }
        },
        [userId]
    );

    const authenticateForAction = useCallback(
        async (action: HighRiskAction): Promise<AuthenticationResult> => {
            try {
                setState(prev => ({ ...prev, error: null }));
                const result = await biometricAuthService.authenticateForAction(action, userId);

                if (!result.success && result.error) {
                    if (isMounted.current) {
                        setState(prev => ({ ...prev, error: result.error || null }));
                    }
                }

                return result;
            } catch (error) {
                reportError(error, 'useBiometricAuth:authenticateForAction');
                const errorMessage = 'Authentication failed unexpectedly';
                if (isMounted.current) {
                    setState(prev => ({ ...prev, error: errorMessage }));
                }
                return {
                    success: false,
                    error: errorMessage,
                    errorCode: 'HOOK_ERROR',
                };
            }
        },
        [userId]
    );

    const updateSettings = useCallback(
        async (newSettings: Partial<BiometricSettings>): Promise<void> => {
            try {
                setState(prev => ({ ...prev, error: null }));
                await biometricAuthService.updateSettings(newSettings);
                const settings = biometricAuthService.getSettings();

                if (isMounted.current) {
                    setState(prev => ({ ...prev, settings }));
                }

                reportInfo('Biometric settings updated via hook', 'useBiometricAuth:updateSettings', {
                    newSettings,
                });
            } catch (error) {
                reportError(error, 'useBiometricAuth:updateSettings');
                if (isMounted.current) {
                    setState(prev => ({ ...prev, error: 'Failed to update settings' }));
                }
                throw error;
            }
        },
        []
    );

    const resetSettings = useCallback(async (): Promise<void> => {
        try {
            setState(prev => ({ ...prev, error: null }));
            await biometricAuthService.resetSettings();
            const settings = biometricAuthService.getSettings();

            if (isMounted.current) {
                setState(prev => ({ ...prev, settings }));
            }

            reportInfo('Biometric settings reset via hook', 'useBiometricAuth:resetSettings');
        } catch (error) {
            reportError(error, 'useBiometricAuth:resetSettings');
            if (isMounted.current) {
                setState(prev => ({ ...prev, error: 'Failed to reset settings' }));
            }
            throw error;
        }
    }, []);

    const refresh = useCallback(async (): Promise<void> => {
        await loadCapabilitiesAndSettings();
    }, [loadCapabilitiesAndSettings]);

    const clearError = useCallback((): void => {
        if (isMounted.current) {
            setState(prev => ({ ...prev, error: null }));
        }
    }, []);

    return {
        ...state,
        authenticate,
        authenticateForAction,
        updateSettings,
        resetSettings,
        refresh,
        clearError,
    };
}

export function useBiometricProtection(
    action: HighRiskAction,
    onSuccess: () => void | Promise<void>,
    onCancel?: () => void,
    userId?: string
) {
    const { authenticateForAction, isLoading, error, settings, isAvailable } = useBiometricAuth(userId);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const executeWithProtection = useCallback(async () => {
        if (isLoading) return;

        setIsAuthenticating(true);
        setAuthError(null);

        try {
            const result = await authenticateForAction(action);

            if (result.success) {
                await onSuccess();
            } else if (result.errorCode === 'user_cancel') {
                onCancel?.();
            } else {
                setAuthError(result.error || 'Authentication failed');
            }
        } catch (error) {
            reportError(error, 'useBiometricProtection:executeWithProtection');
            setAuthError('An unexpected error occurred');
        } finally {
            setIsAuthenticating(false);
        }
    }, [isLoading, authenticateForAction, action, onSuccess, onCancel]);

    const clearAuthError = useCallback(() => {
        setAuthError(null);
    }, []);

    return {
        executeWithProtection,
        isAuthenticating,
        authError,
        clearAuthError,
        isLoading,
        error,
        settings,
        isAvailable,
        isBiometricEnabled: settings?.enabled ?? false,
    };
}

export default useBiometricAuth;
