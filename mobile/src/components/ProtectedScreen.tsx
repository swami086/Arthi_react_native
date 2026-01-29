import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import { HighRiskAction } from '../services/biometricAuthService';

interface ProtectedScreenProps {
    children: ReactNode;
    action?: HighRiskAction;
    title?: string;
    description?: string;
    onAuthSuccess?: () => void;
    onAuthFailure?: (error: string) => void;
    onCancel?: () => void;
    fallbackComponent?: ReactNode;
    loadingComponent?: ReactNode;
    requireAuthOnMount?: boolean;
}

export function ProtectedScreen({
    children,
    action,
    title = 'Authentication Required',
    description,
    onAuthSuccess,
    onAuthFailure,
    onCancel,
    fallbackComponent,
    loadingComponent,
    requireAuthOnMount = true,
}: ProtectedScreenProps) {
    const {
        isAvailable,
        isEnrolled,
        isEnabled,
        biometricDisplayName,
        isLoading: isLoadingBiometric,
        requireAuthForAction,
        authenticate,
    } = useBiometricAuth();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [hasAttempted, setHasAttempted] = useState(false);

    const getDefaultDescription = useCallback((): string => {
        if (description) return description;

        const actionDescriptions: Record<HighRiskAction, string> = {
            booking_appointment: 'This screen requires authentication to book appointments',
            approving_soap_note: 'This screen requires authentication to approve SOAP notes',
            processing_payment: 'This screen requires authentication to process payments',
            deleting_data: 'This screen requires authentication to delete data',
            exporting_data: 'This screen requires authentication to export data',
        };

        if (action && actionDescriptions[action]) {
            return actionDescriptions[action];
        }

        return `Authenticate with ${biometricDisplayName} to access this screen`;
    }, [description, action, biometricDisplayName]);

    const performAuthentication = useCallback(async () => {
        if (isAuthenticating) return;

        setIsAuthenticating(true);
        setAuthError(null);

        try {
            const result = action
                ? await requireAuthForAction(action, getDefaultDescription())
                : await authenticate(getDefaultDescription());

            if (result.success) {
                setIsAuthenticated(true);
                onAuthSuccess?.();
            } else {
                setAuthError(result.error || 'Authentication failed');
                onAuthFailure?.(result.error || 'Authentication failed');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
            setAuthError(errorMessage);
            onAuthFailure?.(errorMessage);
        } finally {
            setIsAuthenticating(false);
            setHasAttempted(true);
        }
    }, [
        isAuthenticating,
        action,
        requireAuthForAction,
        authenticate,
        getDefaultDescription,
        onAuthSuccess,
        onAuthFailure,
    ]);

    useEffect(() => {
        if (isLoadingBiometric || hasAttempted) return;

        if (!isEnabled || !isAvailable) {
            setIsAuthenticated(true);
            return;
        }

        if (requireAuthOnMount) {
            performAuthentication();
        }
    }, [isLoadingBiometric, isEnabled, isAvailable, requireAuthOnMount, hasAttempted, performAuthentication]);

    const handleRetry = useCallback(() => {
        setHasAttempted(false);
        setAuthError(null);
        performAuthentication();
    }, [performAuthentication]);

    const handleCancel = useCallback(() => {
        onCancel?.();
    }, [onCancel]);

    if (isLoadingBiometric) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }

        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#30bae8" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    if (!isEnabled || !isAvailable || isAuthenticated) {
        return <>{children}</>;
    }

    if (isAuthenticating) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }

        return (
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <ActivityIndicator size="large" color="#30bae8" />
                </View>
                <Text style={styles.title}>Authenticating...</Text>
                <Text style={styles.description}>
                    Please complete {biometricDisplayName} authentication
                </Text>
            </View>
        );
    }

    if (authError) {
        if (fallbackComponent) {
            return <>{fallbackComponent}</>;
        }

        return (
            <View style={styles.container}>
                <View style={[styles.iconContainer, styles.errorIconContainer]}>
                    <Ionicons name="lock-closed" size={48} color="#ef4444" />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{getDefaultDescription()}</Text>

                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text style={styles.errorText}>{authError}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
                        <Ionicons
                            name="refresh"
                            size={20}
                            color="white"
                            style={styles.buttonIcon}
                        />
                        <Text style={styles.primaryButtonText}>Try Again</Text>
                    </TouchableOpacity>

                    {onCancel && (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Go Back</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={48} color="#30bae8" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{getDefaultDescription()}</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={performAuthentication}>
                    <Ionicons
                        name="finger-print"
                        size={20}
                        color="white"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.primaryButtonText}>Authenticate</Text>
                </TouchableOpacity>

                {onCancel && (
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f9fafb',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    errorIconContainer: {
        backgroundColor: '#fef2f2',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        maxWidth: 320,
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
        marginLeft: 8,
        flex: 1,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 280,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#30bae8',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
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
    cancelButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6b7280',
        fontSize: 14,
    },
});

export default ProtectedScreen;
