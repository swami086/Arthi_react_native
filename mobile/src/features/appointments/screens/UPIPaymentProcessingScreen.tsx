import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { usePayment } from '../hooks/usePayment';
import { MotiView } from 'moti';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '../../../hooks/useColorScheme';

type UPIPaymentProcessingRouteProp = RouteProp<RootStackParamList, 'UPIPaymentProcessing'>;

const { width } = Dimensions.get('window');

export const UPIPaymentProcessingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<UPIPaymentProcessingRouteProp>();
    const { paymentId, appointmentId } = route.params;
    const { simulateUPIPayment } = usePayment();
    const { isDark } = useColorScheme();

    useEffect(() => {
        const processPayment = async () => {
            // Simulate a slight delay to show the progress animation
            await new Promise(resolve => setTimeout(resolve, 2000));

            const success = await simulateUPIPayment(paymentId);

            if (success) {
                navigation.replace('PaymentSuccess', { paymentId, appointmentId });
            } else {
                Alert.alert(
                    "Payment Failed",
                    "The transaction could not be completed.",
                    [
                        { text: "Retry", onPress: () => navigation.goBack() },
                        {
                            text: "Cancel",
                            onPress: () => navigation.dispatch(
                                CommonActions.navigate({
                                    name: 'Main',
                                    params: { screen: 'Appointments' }
                                })
                            ),
                            style: "cancel"
                        }
                    ]
                );
            }
        };

        processPayment();
    }, [paymentId, appointmentId]);

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blurs */}
            <View className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <View className="absolute -top-[15%] -right-[15%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
                <View className="absolute -bottom-[15%] -left-[15%] w-[300px] h-[300px] bg-slate-200/30 dark:bg-slate-800/30 rounded-full blur-[80px]" />
            </View>

            {/* Main Card */}
            <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-sm bg-surface-light dark:bg-surface-dark rounded-[32px] shadow-2xl border border-white/50 dark:border-white/5 overflow-hidden"
                style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 30 }}
            >
                <View className="flex-col items-center px-6 pt-12 pb-8 gap-8">
                    {/* Spinner & Icon */}
                    <View className="relative w-32 h-32 items-center justify-center">
                        <View className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-110" />
                        <View className="relative w-full h-full">
                            <View className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-gray-800" />
                            <MotiView
                                from={{ rotate: '0deg' }}
                                animate={{ rotate: '360deg' }}
                                transition={{ loop: true, type: 'timing', duration: 1500 }}
                                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"
                            />
                            <View className="absolute inset-0 items-center justify-center">
                                <MaterialIcons name="credit-card" size={36} color="#30bae8" />
                            </View>
                        </View>
                    </View>

                    {/* Text */}
                    <View className="items-center space-y-2">
                        <Text className="text-text-main-light dark:text-text-main-dark text-2xl font-bold tracking-tight text-center">
                            Processing Payment...
                        </Text>
                        <Text className="text-text-sub-light dark:text-text-sub-dark text-sm font-medium leading-relaxed max-w-[250px] text-center mx-auto">
                            Please don't close the app. This will only take a moment.
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="w-full space-y-2.5 px-4">
                        <View className="flex-row justify-between items-center px-1 mb-2">
                            <Text className="text-[10px] uppercase tracking-wider font-bold text-gray-500">Encrypted Transfer</Text>
                            <Text className="text-xs font-bold text-primary">75%</Text>
                        </View>
                        <View className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <MotiView
                                from={{ width: '0%' }}
                                animate={{ width: '75%' }}
                                transition={{ type: 'timing', duration: 1500 }}
                                className="h-full bg-primary rounded-full"
                            />
                        </View>
                    </View>

                    {/* Secure Badge */}
                    <View className="flex-row items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-white/5">
                        <MaterialIcons name="verified-user" size={18} color="#34d399" />
                        <Text className="text-gray-600 dark:text-gray-300 text-xs font-semibold tracking-wide">
                            Secure Payment
                        </Text>
                    </View>
                </View>

                {/* Footer Button used as a cancel action */}
                <View className="pb-6 pt-4 border-t border-gray-100 dark:border-white/5 items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="px-6 py-2 rounded-full"
                    >
                        <Text className="text-sm font-semibold text-text-sub-light dark:text-text-sub-dark hover:text-text-main-light dark:hover:text-white transition-colors">
                            Cancel Payment
                        </Text>
                    </TouchableOpacity>
                </View>
            </MotiView>
        </View>
    );
};
