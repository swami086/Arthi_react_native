import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { usePayment } from '../hooks/usePayment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { format } from 'date-fns';

type PaymentCheckoutRouteProp = RouteProp<RootStackParamList, 'PaymentCheckout'>;

export const PaymentCheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<PaymentCheckoutRouteProp>();
    const { appointmentId, mentorName, amount, selectedDate, selectedTime } = route.params;
    const { initiatePayment, loading } = usePayment();
    const [promoCode, setPromoCode] = useState('');

    const handleProceed = async () => {
        try {
            const payment = await initiatePayment(appointmentId, amount);

            if (payment) {
                navigation.navigate('UPIPaymentProcessing', {
                    paymentId: payment.id,
                    appointmentId
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to initiate payment');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <Button
                    variant="ghost"
                    size="icon"
                    onPress={() => navigation.goBack()}
                    className="mr-2"
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} className="text-gray-900 dark:text-white" />
                </Button>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Checkout</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Appointment Summary */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    className="bg-primary/10 dark:bg-primary/20 p-4 rounded-2xl mb-6"
                >
                    <Text className="text-primary dark:text-primary-light font-bold text-lg mb-2">Session Summary</Text>
                    <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="account" size={20} className="text-gray-600 dark:text-gray-300 mr-2" />
                        <Text className="text-gray-700 dark:text-gray-200">{mentorName}</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <MaterialCommunityIcons name="calendar" size={20} className="text-gray-600 dark:text-gray-300 mr-2" />
                        <Text className="text-gray-700 dark:text-gray-200">{format(new Date(selectedDate), 'PPPP')}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <MaterialCommunityIcons name="clock" size={20} className="text-gray-600 dark:text-gray-300 mr-2" />
                        <Text className="text-gray-700 dark:text-gray-200">{selectedTime}</Text>
                    </View>
                </MotiView>

                {/* Pricing Breakdown */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    delay={100}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
                >
                    <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">Payment Details</Text>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600 dark:text-gray-400">Session Fee</Text>
                        <Text className="text-gray-900 dark:text-white font-medium">₹{amount}</Text>
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600 dark:text-gray-400">Platform Fee</Text>
                        <Text className="text-gray-900 dark:text-white font-medium">₹0</Text>
                    </View>

                    <View className="h-[1px] bg-gray-200 dark:bg-gray-700 my-2" />

                    <View className="flex-row justify-between">
                        <Text className="text-gray-900 dark:text-white font-bold text-lg">Total Amount</Text>
                        <Text className="text-primary font-bold text-lg">₹{amount}</Text>
                    </View>
                </MotiView>

                {/* Payment Method */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    delay={200}
                    className="mb-6"
                >
                    <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">Payment Method</Text>
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-primary dark:border-primary-light flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mr-3">
                                <MaterialCommunityIcons name="bank-transfer" size={24} className="text-gray-900 dark:text-white" />
                            </View>
                            <View>
                                <Text className="text-gray-900 dark:text-white font-bold">UPI Payment</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-xs">GPay, PhonePe, Paytm</Text>
                            </View>
                        </View>
                        <View className="w-6 h-6 rounded-full border-2 border-primary items-center justify-center">
                            <View className="w-3 h-3 rounded-full bg-primary" />
                        </View>
                    </View>
                </MotiView>

                {/* Promo Code */}
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    delay={300}
                    className="mb-8"
                >
                    <Text className="text-gray-900 dark:text-white font-bold text-lg mb-2">Promo Code</Text>
                    <View className="flex-row">
                        <View className="flex-1 mr-2">
                            <Input
                                placeholder="Enter code"
                                value={promoCode}
                                onChangeText={setPromoCode}
                            />
                        </View>
                        <Button variant="outline" onPress={() => {}}>Apply</Button>
                    </View>
                </MotiView>
            </ScrollView>

            <View className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg">
                <Button
                    onPress={handleProceed}
                    loading={loading}
                    size="lg"
                    className="w-full"
                >
                    Pay ₹{amount}
                </Button>
                <Text className="text-center text-gray-400 text-xs mt-2">
                    Secured by Razorpay • 100% Safe & Secure
                </Text>
            </View>
        </SafeAreaView>
    );
};
