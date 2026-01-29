import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '../hooks/useColorScheme';
import { useAuth } from '../features/auth/hooks/useAuth';
import {
    biometricAuthService,
    BiometricType,
    HighRiskAction,
} from '../services/biometricAuthService';
import { reportInfo, reportError } from '../services/rollbar';

interface ProtectedScreenProps {
    children: React.ReactNode;
    action?: HighRiskAction;
    title?: string;
    subtitle?: string;
    onAuthSuccess?: () => void;
    onAuthFailure?: () => void;
    requireAuth?: boolean;
    fallbackComponent?: React.ReactNode;
}

const getBiometricIcon = (type: BiometricType): string => {
    switch (type) {
        case 'face_id':
            return 'face-recognition';
        case 'touch_id':
        case 'fingerprint':
            return 'fingerprint';
        case 'iris':
            return 'eye-outline';
        default:
            return 'shield-lock-outline';
    }
};

const getBiometricDisplayName = (type: BiometricType): string => {
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
};

export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
    children,
    action = 'custom',
    title,
    subtitle,
    onAuthSuccess,
    onAuthFailure,
    requireAuth = true,
    fallbackComponent,
}) => {
    const { isDark } = useColorScheme();
    const { user } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [biometricType, setBiometricType] = useState<BiometricType>('none');
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    useEffect(() => {
        checkAuthRequirement();
    }, []);

    const checkAuthRequirement = async () => {
        try {
            await biometricAuthService.initialize();
            const capabilities = await biometricAuthService.getCapabilities();
            const settings = biometricAuthService.getSettings();

            setBiometricType(capabilities.biometricType);
            setIsBiometricAvailable(capabilities.isAvailable && capabilities.isEnrolled);

            if (!requireAuth || !settings.enabled) {
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }

            if (!capabilities.isAvailable || !capabilities.isEnrolled) {
                setIsAuthenticated(true);
                setIsLoading(false);
                reportInfo('Biometric not available, granting access', 'ProtectedScreen', {
                    action,
                    isAvailable: capabilities.isAvailable,
                    isEnrolled: capabilities.isEnrolled,
                });
                return;
            }

            setIsLoading(false);
            authenticate();
        } catch (err) {
            reportError(err, 'ProtectedScreen:checkAuthRequirement');
            setIsAuthenticated(true);
            setIsLoading(false);
        }
    };

    const authenticate = useCallback(async () => {
        setIsAuthenticating(true);
        setError(null);

        try {
            const result = await biometricAuthService.authenticateForAction(
                action,
                user?.id
            );

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsAuthenticated(true);
                onAuthSuccess?.();
                reportInfo('Protected screen authentication successful', 'ProtectedScreen', {
                    action,
                });
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

                if (result.errorCode === 'user_cancel') {
                    setError('Authentication cancelled');
                    onAuthFailure?.();
                } else {
                    setError(result.error || 'Authentication failed');

                    if (result.retriesRemaining === 0) {
                        onAuthFailure?.();
                    }
                }
            }
        } catch (err) {
            reportError(err, 'ProtectedScreen:authenticate');
            setError('An unexpected error occurred');
        } finally {
            setIsAuthenticating(false);
        }
    }, [action, user?.id, onAuthSuccess, onAuthFailure]);

    const handleRetry = () => {
        setError(null);
        authenticate();
    };

    if (isLoading) {
        return (
            <View
                className={`flex-1 justify-center items-center ${
                    isDark ? 'bg-gray-900' : 'bg-gray-50'
                }`}
            >
                <ActivityIndicator
                    size="large"
                    color={isDark ? '#60A5FA' : '#3B82F6'}
                />
            </View>
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    if (fallbackComponent && !isBiometricAvailable) {
        return <>{fallbackComponent}</>;
    }

    const biometricName = getBiometricDisplayName(biometricType);
    const displayTitle = title || 'Authentication Required';
    const displaySubtitle =
        subtitle || `Use ${biometricName} to access this screen`;

    return (
        <View
            className={`flex-1 justify-center items-center px-6 ${
                isDark ? 'bg-gray-900' : 'bg-gray-50'
            }`}
        >
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 300 }}
                className="items-center"
            >
                <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 100 }}
                    className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
                        error
                            ? 'bg-red-100 dark:bg-red-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                >
                    {isAuthenticating ? (
                        <ActivityIndicator
                            size="large"
                            color={isDark ? '#60A5FA' : '#3B82F6'}
                        />
                    ) : (
                        <MaterialCommunityIcons
                            name={
                                error
                                    ? 'alert-circle-outline'
                                    : getBiometricIcon(biometricType)
                            }
                            size={48}
                            color={
                                error
                                    ? '#EF4444'
                                    : isDark
                                    ? '#60A5FA'
                                    : '#3B82F6'
                            }
                        />
                    )}
                </MotiView>

                <Text
                    className={`text-2xl font-bold text-center mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}
                >
                    {displayTitle}
                </Text>

                <Text
                    className={`text-center mb-8 px-4 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                >
                    {error || displaySubtitle}
                </Text>

                <TouchableOpacity
                    onPress={handleRetry}
                    disabled={isAuthenticating}
                    className={`py-4 px-12 rounded-2xl mb-4 ${
                        isAuthenticating
                            ? 'bg-gray-400'
                            : 'bg-blue-500'
                    }`}
                    activeOpacity={0.8}
                >
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons
                            name={getBiometricIcon(biometricType)}
                            size={24}
                            color="white"
                        />
                        <Text className="text-white font-semibold text-lg ml-2">
                            {error ? 'Try Again' : `Use ${biometricName}`}
                        </Text>
                    </View>
                </TouchableOpacity>

                {error && (
                    <Text
                        className={`text-sm text-center ${
                            isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}
                    >
                        Tap the button above to authenticate
                    </Text>
                )}
            </MotiView>
        </View>
    );
};

interface ProtectedActionProps {
    action: HighRiskAction;
    onExecute: () => void | Promise<void>;
    onCancel?: () => void;
    children: (props: {
        execute: () => void;
        isAuthenticating: boolean;
    }) => React.ReactNode;
}

export const ProtectedAction: React.FC<ProtectedActionProps> = ({
    action,
    onExecute,
    onCancel,
    children,
}) => {
    const { user } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const execute = useCallback(async () => {
        setIsAuthenticating(true);

        try {
            const result = await biometricAuthService.authenticateForAction(
                action,
                user?.id
            );

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await onExecute();
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                if (result.errorCode === 'user_cancel') {
                    onCancel?.();
                }
            }
        } catch (err) {
            reportError(err, 'ProtectedAction:execute');
        } finally {
            setIsAuthenticating(false);
        }
    }, [action, user?.id, onExecute, onCancel]);

    return <>{children({ execute, isAuthenticating })}</>;
};

export default ProtectedScreen;
