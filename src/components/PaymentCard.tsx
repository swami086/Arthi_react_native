import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Payment } from '../api/types';
import { format } from 'date-fns';

interface PaymentCardProps {
    payment: Payment;
    onPress?: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onPress }) => {
    const isSuccess = payment.status === 'completed';
    const isFailed = payment.status === 'failed';

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4 border border-gray-100 dark:border-gray-700"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="text-gray-900 dark:text-white font-bold text-lg">
                        {payment.currency} {payment.amount}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        {format(new Date(payment.created_at), 'PPP')}
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded-full flex-row items-center ${
                    isSuccess ? 'bg-green-100 dark:bg-green-900/30' :
                    isFailed ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                    <MaterialCommunityIcons
                        name={isSuccess ? "check-circle" : isFailed ? "alert-circle" : "clock"}
                        size={12}
                        color={isSuccess ? "#16a34a" : isFailed ? "#dc2626" : "#ca8a04"}
                    />
                    <Text className={`ml-1 text-xs font-medium ${
                        isSuccess ? 'text-green-700 dark:text-green-400' :
                        isFailed ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'
                    }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    {payment.payment_method || 'Unknown Method'}
                </Text>
                {payment.razorpay_payment_id && (
                    <Text className="text-gray-400 dark:text-gray-500 text-xs font-mono">
                        {payment.razorpay_payment_id.slice(-6)}
                    </Text>
                )}
            </View>
        </MotiView>
    );
};
