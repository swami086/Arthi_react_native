import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Payment } from '../api/types';
import { format } from 'date-fns';
import { tokens } from '../design-system/tokens';

interface PaymentCardProps {
    payment: Payment;
    onPress?: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onPress }) => {
    const isSuccess = payment.status === 'completed';
    const isFailed = payment.status === 'failed';

    const getStatusColor = () => {
        if (isSuccess) return tokens.colors.status.success;
        if (isFailed) return tokens.colors.status.error;
        return tokens.colors.status.warning;
    };
    const statusColor = getStatusColor();

    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="bg-surface dark:bg-surface-dark rounded-2xl p-4 shadow-soft mb-4 border border-border dark:border-border-dark"
        >
            <View className="flex-row justify-between items-start mb-2 gap-2">
                <View>
                    <Text className="text-text-primary dark:text-text-primary-dark font-bold text-lg font-primary">
                        {payment.currency} {payment.amount}
                    </Text>
                    <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-primary">
                        {format(new Date(payment.created_at), 'PPP')}
                    </Text>
                </View>
                <View
                    className="px-2 py-1.5 rounded-full flex-row items-center"
                    style={{ backgroundColor: `${statusColor}20` }}
                >
                    <MaterialCommunityIcons
                        name={isSuccess ? "check-circle" : isFailed ? "alert-circle" : "clock"}
                        size={12}
                        color={statusColor}
                    />
                    <Text
                        className="ml-1 text-xs font-medium font-primary capitalize"
                        style={{ color: statusColor }}
                    >
                        {payment.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-border dark:border-border-dark">
                <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-primary">
                    {payment.payment_method || 'Unknown Method'}
                </Text>
                {payment.razorpay_payment_id && (
                    <Text className="text-text-secondary dark:text-text-secondary-dark text-xs font-mono opacity-70">
                        {payment.razorpay_payment_id.slice(-6)}
                    </Text>
                )}
            </View>
        </MotiView>
    );
};
