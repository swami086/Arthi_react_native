import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { usePayment } from '../hooks/usePayment';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/Button';

type UPIPaymentProcessingRouteProp = RouteProp<RootStackParamList, 'UPIPaymentProcessing'>;

export const UPIPaymentProcessingScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<UPIPaymentProcessingRouteProp>();
    const { paymentId, appointmentId } = route.params;
    const { simulateUPIPayment } = usePayment();

    useEffect(() => {
        const processPayment = async () => {
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
        <View className="flex-1 bg-gray-900/50 justify-center items-center px-4">
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-sm items-center shadow-xl"
            >
                <MotiView
                    from={{ rotate: '0deg' }}
                    animate={{ rotate: '360deg' }}
                    transition={{ loop: true, duration: 2000, type: 'timing' }}
                    className="mb-6"
                >
                    <ActivityIndicator size="large" color="#30bae8" />
                </MotiView>

                <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    Processing Payment
                </Text>

                <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
                    Please approve the request in your UPI app. Do not press back or close the app.
                </Text>

                <View className="flex-row items-center bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-full mb-6">
                    <MaterialCommunityIcons name="shield-check" size={16} color="#16a34a" />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        100% Secure Transaction
                    </Text>
                </View>

                <Button
                    variant="ghost"
                    onPress={() => navigation.goBack()}
                    className="w-full"
                >
                    Cancel
                </Button>
            </MotiView>
        </View>
    );
};
