import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '../hooks/useColorScheme';
import {
    biometricAuthService,
    BiometricType,
    AuthenticationResult,
    HighRiskAction,
} from '../services/biometricAuthService';
import { reportInfo } from '../services/rollbar';

interface BiometricPromptProps {
    visible: boolean;
    action: HighRiskAction;
    title?: string;
    subtitle?: string;
    onSuccess: () => void;
    onCancel: () => void;
    onFallback?: () => void;
    userId?: string;
    showFallbackOption?: boolean;
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

const getActionTitle = (action: HighRiskAction): string => {
    switch (action) {
        case 'booking':
            return 'Confirm Booking';
        case 'soap_approval':
            return 'Approve SOAP Notes';
        case 'payment':
            return 'Confirm Payment';
        case 'deletion':
            return 'Confirm Deletion';
        default:
            return 'Confirm Action';
    }
};

const getActionSubtitle = (action: HighRiskAction, biometricName: string): string => {
    switch (action) {
        case 'booking':
            return `Use ${biometricName} to confirm this appointment booking`;
        case 'soap_approval':
            return `Use ${biometricName} to approve these SOAP notes`;
        case 'payment':
            return `Use ${biometricName} to authorize this payment`;
        case 'deletion':
            return `Use ${biometricName} to confirm deletion`;
        default:
            return `Use ${biometricName} to continue`;
    }
};

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
    visible,
    action,
    title,
    subtitle,
    onSuccess,
    onCancel,
    onFallback,
    userId,
    showFallbackOption = true,
}) => {
    const { isDark } = useColorScheme();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retriesRemaining, setRetriesRemaining] = useState<number | null>(null);
    const [biometricType, setBiometricType] = useState<BiometricType>('none');

    useEffect(() => {
        if (visible) {
            loadBiometricType();
        }
    }, [visible]);

    const loadBiometricType = async () => {
        const capabilities = await biometricAuthService.getCapabilities();
        setBiometricType(capabilities.biometricType);
    };

    const handleAuthenticate = useCallback(async () => {
        setIsAuthenticating(true);
        setError(null);

        try {
            const result: AuthenticationResult = await biometricAuthService.authenticateForAction(
                action,
                userId
            );

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                reportInfo('Biometric prompt authentication successful', 'BiometricPrompt', {
                    action,
                });
                onSuccess();
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

                if (result.errorCode === 'user_cancel') {
                    onCancel();
                    return;
                }

                if (result.errorCode === 'user_fallback' && onFallback) {
                    onFallback();
                    return;
                }

                setError(result.error || 'Authentication failed');
                setRetriesRemaining(result.retriesRemaining ?? null);

                if (result.retriesRemaining === 0) {
                    setTimeout(() => {
                        onCancel();
                    }, 2000);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsAuthenticating(false);
        }
    }, [action, userId, onSuccess, onCancel, onFallback]);

    useEffect(() => {
        if (visible && !isAuthenticating && !error) {
            const timer = setTimeout(() => {
                handleAuthenticate();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleRetry = () => {
        setError(null);
        handleAuthenticate();
    };

    const handleFallback = () => {
        if (onFallback) {
            onFallback();
        } else {
            onCancel();
        }
    };

    const biometricName = getBiometricDisplayName(biometricType);
    const displayTitle = title || getActionTitle(action);
    const displaySubtitle = subtitle || getActionSubtitle(action, biometricName);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View
                className="flex-1 justify-center items-center"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
                <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 200 }}
                    className={`mx-6 rounded-3xl p-6 w-80 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    <View className="items-center">
                        <MotiView
                            from={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 100 }}
                            className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
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
                                    name={error ? 'alert-circle-outline' : getBiometricIcon(biometricType)}
                                    size={40}
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
                            className={`text-xl font-bold text-center mb-2 ${
                                isDark ? 'text-white' : 'text-gray-900'
                            }`}
                        >
                            {displayTitle}
                        </Text>

                        <Text
                            className={`text-center mb-4 ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                        >
                            {error || displaySubtitle}
                        </Text>

                        {retriesRemaining !== null && retriesRemaining > 0 && error && (
                            <Text
                                className={`text-sm text-center mb-4 ${
                                    isDark ? 'text-gray-500' : 'text-gray-500'
                                }`}
                            >
                                {retriesRemaining} {retriesRemaining === 1 ? 'attempt' : 'attempts'} remaining
                            </Text>
                        )}

                        {error && retriesRemaining !== 0 && (
                            <TouchableOpacity
                                onPress={handleRetry}
                                className="bg-blue-500 py-3 px-8 rounded-xl mb-3 w-full"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-semibold text-center">
                                    Try Again
                                </Text>
                            </TouchableOpacity>
                        )}

                        {showFallbackOption && (
                            <TouchableOpacity
                                onPress={handleFallback}
                                className={`py-3 px-8 rounded-xl mb-3 w-full ${
                                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                                }`}
                                activeOpacity={0.8}
                            >
                                <Text
                                    className={`font-semibold text-center ${
                                        isDark ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                                >
                                    Use Password Instead
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={onCancel}
                            className="py-2"
                            activeOpacity={0.8}
                        >
                            <Text className="text-red-500 font-medium">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </MotiView>
            </View>
        </Modal>
    );
};

interface BiometricButtonProps {
    action: HighRiskAction;
    onAuthenticated: () => void;
    onCancel?: () => void;
    userId?: string;
    children: React.ReactNode;
    disabled?: boolean;
    style?: object;
    className?: string;
}

export const BiometricButton: React.FC<BiometricButtonProps> = ({
    action,
    onAuthenticated,
    onCancel,
    userId,
    children,
    disabled = false,
    style,
    className,
}) => {
    const [showPrompt, setShowPrompt] = useState(false);

    const handlePress = () => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowPrompt(true);
    };

    const handleSuccess = () => {
        setShowPrompt(false);
        onAuthenticated();
    };

    const handleCancel = () => {
        setShowPrompt(false);
        onCancel?.();
    };

    return (
        <>
            <TouchableOpacity
                onPress={handlePress}
                disabled={disabled}
                style={style}
                className={className}
                activeOpacity={0.8}
            >
                {children}
            </TouchableOpacity>

            <BiometricPrompt
                visible={showPrompt}
                action={action}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                userId={userId}
            />
        </>
    );
};

export default BiometricPrompt;
