import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { usePayment } from '../hooks/usePayment';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { ActivityIndicator } from 'react-native';
import { reportError } from '../../../services/rollbar';

type PaymentCheckoutRouteProp = RouteProp<RootStackParamList, 'PaymentCheckout'>;

export const PaymentCheckoutScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<PaymentCheckoutRouteProp>();
    const { appointmentId, therapistName, therapistAvatar, amount, selectedDate, selectedTime } = route.params;
    const { initiatePayment, loading } = usePayment();
    const { isDark } = useColorScheme();
    const [promoCode, setPromoCode] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
    const [agreeTerms, setAgreeTerms] = useState(false);

    // Mock platform fee logic
    const sessionFee = amount;
    const platformFee = Math.round(amount * 0.1);
    const totalAmount = sessionFee + platformFee;

    const handleProceed = async () => {
        if (!agreeTerms) {
            Alert.alert("Terms Required", "Please agree to the Terms of Service to proceed.");
            return;
        }

        try {
            const payment = await initiatePayment(appointmentId, totalAmount);
            if (payment) {
                navigation.navigate('UPIPaymentProcessing', {
                    paymentId: payment.id,
                    appointmentId
                });
            }
        } catch (error) {
            reportError(error, 'PaymentCheckout:handleProceed');
            Alert.alert('Error', 'Failed to initiate payment');
        }
    };

    const formattedDate = selectedDate && !isNaN(new Date(selectedDate).getTime())
        ? format(new Date(selectedDate), 'MMM d')
        : 'Invalid Date';

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
            <View className="flex-1">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 pb-2 z-10 bg-background-light dark:bg-background-dark">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="flex items-center justify-center w-10 h-10 rounded-full active:bg-gray-200 dark:active:bg-white/10"
                    >
                        <MaterialIcons name="arrow-back-ios" size={20} color={isDark ? "#fff" : "#0f172a"} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-text-main-light dark:text-text-main-dark">
                        Payment Details
                    </Text>
                </View>

                <ScrollView className="flex-1 px-4 space-y-6 pb-32" showsVerticalScrollIndicator={false}>
                    {/* Appointment Summary Card */}
                    <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 shadow-sm mt-4">
                        <View className="flex-row items-center gap-4 mb-4">
                            <Image
                                source={{ uri: therapistAvatar }}
                                className="w-16 h-16 rounded-full bg-gray-200 border-2 border-primary/20"
                            />
                            <View>
                                <Text className="text-base font-bold text-text-main-light dark:text-text-main-dark">{therapistName}</Text>
                                <Text className="text-sm text-text-sub-light dark:text-text-sub-dark font-medium">Clinical Psychologist</Text>
                                <View className="flex-row items-center gap-1 mt-1">
                                    <MaterialIcons name="star" size={16} color="#30bae8" />
                                    <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">4.9</Text>
                                    <Text className="text-xs text-text-sub-light dark:text-text-sub-dark">(120 reviews)</Text>
                                </View>
                            </View>
                        </View>
                        <View className="h-px bg-gray-100 dark:bg-white/5 w-full my-3" />
                        <View className="flex-row gap-3">
                            <View className="flex-1 flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MaterialIcons name="calendar-today" size={16} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-text-sub-dark font-bold">Date & Time</Text>
                                    <Text className="text-xs font-semibold text-text-main-light dark:text-text-main-dark">{formattedDate} • {selectedTime}</Text>
                                </View>
                            </View>
                            <View className="flex-1 flex-row items-center gap-2">
                                <View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MaterialIcons name="videocam" size={18} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-text-sub-dark font-bold">Type</Text>
                                    <Text className="text-xs font-semibold text-text-main-light dark:text-text-main-dark">Video • 45 mins</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Payment Methods */}
                    <View className="mt-6">
                        <Text className="text-base font-bold mb-3 px-1 text-text-main-light dark:text-text-main-dark">Payment Methods</Text>
                        <View className="space-y-3 gap-3">
                            {/* UPI */}
                            <TouchableOpacity
                                onPress={() => setSelectedMethod('upi')}
                                className={`flex-row items-center justify-between p-4 rounded-2xl border transition-all ${selectedMethod === 'upi'
                                    ? 'bg-surface-light dark:bg-surface-dark border-primary shadow-md shadow-primary/5'
                                    : 'bg-surface-light dark:bg-surface-dark border-transparent'
                                    }`}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <MaterialIcons name="account-balance-wallet" size={24} color={isDark ? "#fff" : "#0f172a"} />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">UPI</Text>
                                        <Text className="text-xs text-text-sub-light dark:text-text-sub-dark">GPay, PhonePe, Paytm</Text>
                                    </View>
                                </View>
                                <View className={`w-5 h-5 rounded-full border items-center justify-center ${selectedMethod === 'upi' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {selectedMethod === 'upi' && <View className="w-3 h-3 rounded-full bg-primary" />}
                                </View>
                            </TouchableOpacity>

                            {/* Card */}
                            <TouchableOpacity
                                onPress={() => setSelectedMethod('card')}
                                className={`flex-row items-center justify-between p-4 rounded-2xl border transition-all ${selectedMethod === 'card'
                                    ? 'bg-surface-light dark:bg-surface-dark border-primary shadow-md shadow-primary/5'
                                    : 'bg-surface-light dark:bg-surface-dark border-transparent'
                                    }`}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <MaterialIcons name="credit-card" size={24} color={isDark ? "#94aeb8" : "#64748b"} />
                                    </View>
                                    <Text className="text-sm font-medium text-slate-600 dark:text-text-sub-dark">Credit / Debit Card</Text>
                                </View>
                                <View className={`w-5 h-5 rounded-full border items-center justify-center ${selectedMethod === 'card' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {selectedMethod === 'card' && <View className="w-3 h-3 rounded-full bg-primary" />}
                                </View>
                            </TouchableOpacity>

                            {/* Net Banking */}
                            <TouchableOpacity
                                onPress={() => setSelectedMethod('netbanking')}
                                className={`flex-row items-center justify-between p-4 rounded-2xl border transition-all ${selectedMethod === 'netbanking'
                                    ? 'bg-surface-light dark:bg-surface-dark border-primary shadow-md shadow-primary/5'
                                    : 'bg-surface-light dark:bg-surface-dark border-transparent'
                                    }`}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                        <MaterialIcons name="account-balance" size={24} color={isDark ? "#94aeb8" : "#64748b"} />
                                    </View>
                                    <Text className="text-sm font-medium text-slate-600 dark:text-text-sub-dark">Net Banking</Text>
                                </View>
                                <View className={`w-5 h-5 rounded-full border items-center justify-center ${selectedMethod === 'netbanking' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {selectedMethod === 'netbanking' && <View className="w-3 h-3 rounded-full bg-primary" />}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Promo Code */}
                    <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-2 flex-row gap-2 items-center border border-transparent focus:border-primary/50 mt-6">
                        <View className="pl-3">
                            <MaterialIcons name="local-offer" size={20} color="#30bae8" />
                        </View>
                        <TextInput
                            className="flex-1 bg-transparent text-sm p-2 text-text-main-light dark:text-text-main-dark placeholder:text-slate-400 dark:placeholder:text-text-sub-dark/50"
                            placeholder="Enter promo code"
                            placeholderTextColor={isDark ? "#4b5563" : "#9ca3af"}
                            value={promoCode}
                            onChangeText={setPromoCode}
                        />
                        <TouchableOpacity className="px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-xl">
                            <Text className="text-xs font-bold text-primary">Apply</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Payment Breakdown */}
                    <View className="bg-surface-light dark:bg-surface-dark rounded-2xl p-4 space-y-3 gap-3 mt-6">
                        <View className="flex-row justify-between items-center text-sm">
                            <Text className="text-slate-500 dark:text-text-sub-dark">Session Fee</Text>
                            <Text className="font-medium text-text-main-light dark:text-text-main-dark">₹{sessionFee}</Text>
                        </View>
                        <View className="flex-row justify-between items-center text-sm">
                            <Text className="text-slate-500 dark:text-text-sub-dark">Platform Fee (10%)</Text>
                            <Text className="font-medium text-text-main-light dark:text-text-main-dark">₹{platformFee}</Text>
                        </View>
                        <View className="h-px bg-slate-100 dark:bg-white/5 w-full my-1" />
                        <View className="flex-row justify-between items-center">
                            <Text className="font-bold text-slate-600 dark:text-text-sub-dark">Total Amount</Text>
                            <Text className="font-extrabold text-lg text-primary">₹{totalAmount}</Text>
                        </View>
                    </View>

                    {/* Terms Checkbox */}
                    <TouchableOpacity
                        className="flex-row items-center gap-3 px-2 mt-2 mb-20"
                        onPress={() => setAgreeTerms(!agreeTerms)}
                        activeOpacity={0.8}
                    >
                        <View className={`h-5 w-5 rounded-md border-2 items-center justify-center ${agreeTerms ? 'bg-primary border-primary' : 'border-slate-400 dark:border-text-sub-dark'}`}>
                            {agreeTerms && <MaterialIcons name="check" size={14} color="white" />}
                        </View>
                        <Text className="text-xs leading-relaxed text-slate-500 dark:text-text-sub-dark flex-shrink">
                            I agree to the <Text className="text-primary font-bold">Terms of Service</Text> and <Text className="text-primary font-bold">Cancellation Policy</Text>.
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Fixed Footer */}
                <View className="absolute bottom-0 w-full bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md p-4 pt-4 pb-6 border-t border-slate-100 dark:border-white/5 rounded-t-3xl shadow-lg z-20">
                    <TouchableOpacity
                        onPress={handleProceed}
                        disabled={loading}
                        className="w-full bg-primary rounded-full py-4 shadow-lg shadow-primary/25 flex-row items-center justify-center gap-2 mb-3 active:opacity-90"
                    >
                        {loading ? <ActivityIndicator color="white" /> : (
                            <>
                                <Text className="text-white font-bold text-base">Proceed to Pay</Text>
                                <Text className="text-white font-extrabold text-base">₹{totalAmount}</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                    <View className="flex-row items-center justify-center gap-1.5 opacity-60">
                        <MaterialIcons name="lock" size={14} color={isDark ? "#94aeb8" : "#94aeb8"} />
                        <Text className="text-[10px] font-medium text-slate-400 dark:text-text-sub-dark uppercase tracking-wide">
                            100% Safe & Secured by Razorpay
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
