import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { BiometricAuthResult, HighRiskAction } from '../services/biometricAuthService';

interface BiometricPromptProps {
    visible: boolean;
    title?: string;
    description?: string;
    action?: HighRiskAction;
    onSuccess: () => void;
    onCancel: () => void;
    onFallback?: () => void;
    showFallbackOption?: boolean;
    fallbackLabel?: string;
}

export function BiometricPrompt({
    visible,
    title = 'Authentication Required',
    description,
    action,
    onSuccess,
    onCancel,
    onFallback,
    showFallbackOption = true,
    fallbackLabel = 'Use Password Instead',
}: BiometricPromptProps) {
    const {
        biometricType,
        biometricDisplayName,
        isAvailable,
        isEnrolled,
        authenticate,
        requireAuthForAction,
    } = useBiometricAuth();

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);

    const maxAttempts = 3;

    const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
        switch (biometricType) {
            case 'face_id':
                return Platform.OS === 'ios' ? 'scan' : 'happy-outline';
            case 'touch_id':
            case 'fingerprint':
                return 'finger-print';
            case 'iris':
                return 'eye-outline';
            default:
                return 'lock-closed-outline';
        }
    };

    const getDefaultDescription = (): string => {
        if (description) return description;

        const actionDescriptions: Record<HighRiskAction, string> = {
            booking_appointment: 'Confirm your identity to book this appointment',
            approving_soap_note: 'Confirm your identity to approve this SOAP note',
            processing_payment: 'Confirm your identity to process this payment',
            deleting_data: 'Confirm your identity to delete this data',
            exporting_data: 'Confirm your identity to export this data',
        };

        if (action && actionDescriptions[action]) {
            return actionDescriptions[action];
        }

        return `Authenticate with ${biometricDisplayName} to continue`;
    };

    const handleAuthenticate = useCallback(async () => {
        if (isAuthenticating) return;

        setIsAuthenticating(true);
        setError(null);

        try {
            let result: BiometricAuthResult;

            if (action) {
                result = await requireAuthForAction(action, getDefaultDescription());
            } else {
                result = await authenticate(getDefaultDescription());
            }

            if (result.success) {
                setAttempts(0);
                onSuccess();
            } else {
                setAttempts((prev) => prev + 1);

                if (result.errorCode === 'user_cancel') {
                    onCancel();
                    return;
                }

                if (result.errorCode === 'user_fallback' && onFallback) {
                    onFallback();
                    return;
                }

                setError(result.error || 'Authentication failed');

                if (attempts + 1 >= maxAttempts) {
                    setError('Maximum attempts reached. Please use password instead.');
                }
            }
        } finally {
            setIsAuthenticating(false);
        }
    }, [
        isAuthenticating,
        action,
        requireAuthForAction,
        authenticate,
        onSuccess,
        onCancel,
        onFallback,
        attempts,
    ]);

    const handleCancel = useCallback(() => {
        setError(null);
        setAttempts(0);
        onCancel();
    }, [onCancel]);

    const handleFallback = useCallback(() => {
        setError(null);
        setAttempts(0);
        if (onFallback) {
            onFallback();
        }
    }, [onFallback]);

    if (!isAvailable || !isEnrolled) {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="warning-outline" size={48} color="#f59e0b" />
                        </View>
                        <Text style={styles.title}>Biometric Not Available</Text>
                        <Text style={styles.description}>
                            {!isAvailable
                                ? 'Your device does not support biometric authentication.'
                                : 'No biometrics are enrolled. Please set up biometrics in your device settings.'}
                        </Text>
                        <View style={styles.buttonContainer}>
                            {showFallbackOption && onFallback && (
                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={handleFallback}
                                >
                                    <Text style={styles.primaryButtonText}>{fallbackLabel}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        {isAuthenticating ? (
                            <ActivityIndicator size="large" color="#30bae8" />
                        ) : (
                            <Ionicons name={getBiometricIcon()} size={48} color="#30bae8" />
                        )}
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{getDefaultDescription()}</Text>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color="#ef4444" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {attempts > 0 && attempts < maxAttempts && (
                        <Text style={styles.attemptsText}>
                            {maxAttempts - attempts} attempt{maxAttempts - attempts !== 1 ? 's' : ''}{' '}
                            remaining
                        </Text>
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                isAuthenticating && styles.disabledButton,
                            ]}
                            onPress={handleAuthenticate}
                            disabled={isAuthenticating}
                        >
                            <Ionicons
                                name={getBiometricIcon()}
                                size={20}
                                color="white"
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.primaryButtonText}>
                                {isAuthenticating
                                    ? 'Authenticating...'
                                    : `Use ${biometricDisplayName}`}
                            </Text>
                        </TouchableOpacity>

                        {showFallbackOption && onFallback && (
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleFallback}
                                disabled={isAuthenticating}
                            >
                                <Text style={styles.secondaryButtonText}>{fallbackLabel}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                            disabled={isAuthenticating}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 20,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        width: '100%',
    },
    errorText: {
        fontSize: 13,
        color: '#ef4444',
        marginLeft: 8,
        flex: 1,
    },
    attemptsText: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 12,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    primaryButton: {
        backgroundColor: '#30bae8',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonIcon: {
        marginRight: 8,
    },
    secondaryButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    cancelButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 14,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

export default BiometricPrompt;
