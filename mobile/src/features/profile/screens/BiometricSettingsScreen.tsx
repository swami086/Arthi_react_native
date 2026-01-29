import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useBiometricAuth } from '../../../hooks/useBiometricAuth';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { HighRiskAction } from '../../../services/biometricAuthService';
import { reportInfo } from '../../../services/rollbar';

interface ActionItem {
    action: HighRiskAction;
    title: string;
    description: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const HIGH_RISK_ACTIONS: ActionItem[] = [
    {
        action: 'booking_appointment',
        title: 'Booking Appointments',
        description: 'Require authentication when booking new appointments',
        icon: 'calendar-plus',
    },
    {
        action: 'approving_soap_note',
        title: 'Approving SOAP Notes',
        description: 'Require authentication when approving clinical notes',
        icon: 'file-document-edit',
    },
    {
        action: 'processing_payment',
        title: 'Processing Payments',
        description: 'Require authentication for payment transactions',
        icon: 'credit-card-check',
    },
    {
        action: 'deleting_data',
        title: 'Deleting Data',
        description: 'Require authentication when deleting records',
        icon: 'delete-alert',
    },
];

const TIMEOUT_OPTIONS = [
    { label: '1 minute', value: 1 },
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: 'Always require', value: 0 },
];

const BiometricSettingsScreen = () => {
    const navigation = useNavigation();
    const { isDark } = useColorScheme();
    const {
        isAvailable,
        isEnrolled,
        biometricDisplayName,
        biometricType,
        isEnabled,
        settings,
        isLoading,
        toggleBiometricAuth,
        toggleAction,
        updateSettings,
        isActionEnabled,
    } = useBiometricAuth();

    const handleToggleBiometric = useCallback(
        async (value: boolean) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
                await toggleBiometricAuth(value);
                reportInfo('Biometric auth toggled', 'BiometricSettings', { enabled: value });
            } catch (error) {
                Alert.alert('Error', 'Failed to update biometric settings');
            }
        },
        [toggleBiometricAuth]
    );

    const handleToggleAction = useCallback(
        async (action: HighRiskAction, value: boolean) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            try {
                await toggleAction(action, value);
                reportInfo('Biometric action toggled', 'BiometricSettings', { action, enabled: value });
            } catch (error) {
                Alert.alert('Error', 'Failed to update action settings');
            }
        },
        [toggleAction]
    );

    const handleTimeoutChange = useCallback(
        async (minutes: number) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            try {
                await updateSettings({ timeoutMinutes: minutes });
                reportInfo('Biometric timeout changed', 'BiometricSettings', { timeoutMinutes: minutes });
            } catch (error) {
                Alert.alert('Error', 'Failed to update timeout settings');
            }
        },
        [updateSettings]
    );

    const getBiometricIcon = (): keyof typeof Ionicons.glyphMap => {
        switch (biometricType) {
            case 'face_id':
                return 'scan';
            case 'touch_id':
            case 'fingerprint':
                return 'finger-print';
            case 'iris':
                return 'eye-outline';
            default:
                return 'lock-closed-outline';
        }
    };

    const renderHeader = () => (
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-3 p-2 -ml-2"
                >
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={24}
                        color={isDark ? '#fff' : '#333'}
                    />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    Biometric Security
                </Text>
            </View>
        </View>
    );

    const renderBiometricStatus = () => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100, type: 'timing', duration: 400 }}
            className="mx-4 mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl"
            style={styles.card}
        >
            <View className="flex-row items-center">
                <View
                    className={`p-3 rounded-full mr-4 ${
                        isAvailable && isEnrolled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}
                >
                    <Ionicons
                        name={getBiometricIcon()}
                        size={32}
                        color={isAvailable && isEnrolled ? '#22c55e' : '#f59e0b'}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                        {biometricDisplayName}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {!isAvailable
                            ? 'Not available on this device'
                            : !isEnrolled
                            ? 'Not set up - configure in device settings'
                            : 'Available and ready to use'}
                    </Text>
                </View>
            </View>
        </MotiView>
    );

    const renderMainToggle = () => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200, type: 'timing', duration: 400 }}
            className="mx-4 mt-4 p-4 bg-white dark:bg-gray-800 rounded-2xl"
            style={styles.card}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        Enable Biometric Authentication
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Use {biometricDisplayName} to protect sensitive actions
                    </Text>
                </View>
                <Switch
                    trackColor={{ false: '#e0e0e0', true: '#b0e0f5' }}
                    thumbColor={isEnabled ? '#30bae8' : '#f4f3f4'}
                    ios_backgroundColor="#e0e0e0"
                    onValueChange={handleToggleBiometric}
                    value={isEnabled}
                    disabled={!isAvailable || !isEnrolled}
                />
            </View>
        </MotiView>
    );

    const renderTimeoutSection = () => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, type: 'timing', duration: 400 }}
            className="mx-4 mt-4"
        >
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-2">
                REMEMBER AUTHENTICATION FOR
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden" style={styles.card}>
                {TIMEOUT_OPTIONS.map((option, index) => (
                    <TouchableOpacity
                        key={option.value}
                        className={`flex-row items-center justify-between p-4 ${
                            index < TIMEOUT_OPTIONS.length - 1
                                ? 'border-b border-gray-100 dark:border-gray-700'
                                : ''
                        }`}
                        onPress={() => handleTimeoutChange(option.value)}
                        disabled={!isEnabled}
                    >
                        <Text
                            className={`text-base ${
                                isEnabled
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 dark:text-gray-600'
                            }`}
                        >
                            {option.label}
                        </Text>
                        {settings?.timeoutMinutes === option.value && (
                            <Ionicons name="checkmark" size={20} color="#30bae8" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </MotiView>
    );

    const renderActionsSection = () => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, type: 'timing', duration: 400 }}
            className="mx-4 mt-6"
        >
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-2">
                PROTECTED ACTIONS
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden" style={styles.card}>
                {HIGH_RISK_ACTIONS.map((item, index) => (
                    <View
                        key={item.action}
                        className={`flex-row items-center p-4 ${
                            index < HIGH_RISK_ACTIONS.length - 1
                                ? 'border-b border-gray-100 dark:border-gray-700'
                                : ''
                        }`}
                    >
                        <View className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3">
                            <MaterialCommunityIcons
                                name={item.icon}
                                size={20}
                                color={isDark ? '#9CA3AF' : '#6b7280'}
                            />
                        </View>
                        <View className="flex-1 mr-3">
                            <Text
                                className={`text-base font-medium ${
                                    isEnabled
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-400 dark:text-gray-600'
                                }`}
                            >
                                {item.title}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.description}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: '#e0e0e0', true: '#b0e0f5' }}
                            thumbColor={isActionEnabled(item.action) ? '#30bae8' : '#f4f3f4'}
                            ios_backgroundColor="#e0e0e0"
                            onValueChange={(value) => handleToggleAction(item.action, value)}
                            value={isActionEnabled(item.action)}
                            disabled={!isEnabled}
                        />
                    </View>
                ))}
            </View>
        </MotiView>
    );

    const renderInfoSection = () => (
        <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 500, type: 'timing', duration: 400 }}
            className="mx-4 mt-6 mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl"
        >
            <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <View className="flex-1 ml-2">
                    <Text className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        About Biometric Security
                    </Text>
                    <Text className="text-xs text-blue-600 dark:text-blue-300 mt-1 leading-5">
                        Your biometric data is never stored by this app. Authentication is handled
                        securely by your device's operating system. This adds an extra layer of
                        protection for sensitive healthcare actions.
                    </Text>
                </View>
            </View>
        </MotiView>
    );

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center">
                <Text className="text-gray-500 dark:text-gray-400">Loading...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {renderHeader()}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {renderBiometricStatus()}
                {renderMainToggle()}
                {renderTimeoutSection()}
                {renderActionsSection()}
                {renderInfoSection()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
});

export default BiometricSettingsScreen;
