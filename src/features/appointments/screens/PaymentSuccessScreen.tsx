import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/Button';
import { supabase } from '../../../api/supabase';
import { format } from 'date-fns';

type PaymentSuccessRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

export const PaymentSuccessScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<PaymentSuccessRouteProp>();
    const { paymentId, appointmentId } = route.params;
    const [seconds, setSeconds] = useState(5);
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            const { data } = await supabase
                .from('appointments')
                .select(`
                    *,
                    mentor:profiles!mentor_id(full_name)
                `)
                .eq('id', appointmentId)
                .single();
            setDetails(data);
        };
        fetchDetails();
    }, [appointmentId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigateToHome();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const navigateToHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Appointments' } }],
            })
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900 justify-center px-6">
            <MotiView
                from={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring' }}
                className="items-center mb-8"
            >
                <View className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-4">
                    <MaterialCommunityIcons name="check-bold" size={48} color="#16a34a" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                    Payment Successful!
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                    Your appointment has been confirmed.
                </Text>
            </MotiView>

            {details && (
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    delay={300}
                    className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-700"
                >
                    <Text className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">
                        Appointment Details
                    </Text>

                    <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-600 dark:text-gray-400">Mentor</Text>
                        <Text className="text-gray-900 dark:text-white font-medium">{details.mentor?.full_name}</Text>
                    </View>

                    <View className="flex-row justify-between mb-3">
                        <Text className="text-gray-600 dark:text-gray-400">Date</Text>
                        <Text className="text-gray-900 dark:text-white font-medium">
                            {format(new Date(details.start_time), 'PPP')}
                        </Text>
                    </View>

                    <View className="flex-row justify-between">
                        <Text className="text-gray-600 dark:text-gray-400">Time</Text>
                        <Text className="text-gray-900 dark:text-white font-medium">
                            {format(new Date(details.start_time), 'p')}
                        </Text>
                    </View>
                </MotiView>
            )}

            <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                delay={600}
                className="items-center"
            >
                <Text className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                    Redirecting to appointments in {seconds}s...
                </Text>

                <Button
                    onPress={navigateToHome}
                    className="w-full mb-4"
                >
                    Go to Appointments
                </Button>

                <Button
                    variant="ghost"
                    onPress={() => {
                        // Navigate to payment details/receipt
                        // For now just go home
                        navigateToHome();
                    }}
                >
                    View Receipt
                </Button>
            </MotiView>
        </View>
    );
};
