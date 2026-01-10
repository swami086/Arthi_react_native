import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { MotiView } from 'moti';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../../api/supabase';
import { format } from 'date-fns';
import { useColorScheme } from '../../../hooks/useColorScheme';

type PaymentSuccessRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;

const { width } = Dimensions.get('window');

export const PaymentSuccessScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<PaymentSuccessRouteProp>();
    const { paymentId, appointmentId } = route.params;
    const [details, setDetails] = useState<any>(null);
    const { isDark } = useColorScheme();

    useEffect(() => {
        const fetchDetails = async () => {
            const { data } = await supabase
                .from('appointments')
                .select(`
                    *,
                    therapist:profiles!therapist_id(full_name, avatar_url)
                `)
                .eq('id', appointmentId)
                .single();
            setDetails(data);
        };
        fetchDetails();
    }, [appointmentId]);

    const navigateToHome = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main', params: { screen: 'Appointments' } }],
            })
        );
    };

    const navigateToAppointment = () => {
        // Navigate to specifically this appointment or the list
        // For now, list is safer
        navigateToHome();
    };

    // Derived values
    const therapistName = details?.therapist?.full_name || 'Therapist';
    const therapistAvatar = details?.therapist?.avatar_url || 'https://via.placeholder.com/150';
    const startTimeResult = details && details.start_time && !isNaN(new Date(details.start_time).getTime())
        ? new Date(details.start_time)
        : new Date();

    // Safety check for invalid date before formatting
    const isDateValid = !isNaN(startTimeResult.getTime());
    const formattedDate = isDateValid ? format(startTimeResult, 'MMM d, yyyy') : 'Date TBD';
    const formattedTime = isDateValid ? format(startTimeResult, 'h:mm a') : 'Time TBD';
    const amount = details?.price || 1098; // Fallback or fetched
    const transactionId = `txn_${paymentId?.substring(0, 8) || 'xyz123'}`;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark" edges={['top']}>
            <View className="flex-1 relative">
                <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>

                    {/* Header / Success Animation */}
                    <View className="items-center justify-center pt-8 pb-6 px-4">
                        <MotiView
                            from={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="relative mb-6 items-center justify-center"
                        >
                            <View className="absolute inset-0 bg-green-500/20 blur-xl rounded-full w-24 h-24" />
                            <View className="h-24 w-24 items-center justify-center rounded-full bg-green-500/10 border-2 border-green-500/30">
                                <MaterialIcons name="check" size={48} color="#10B981" />
                            </View>
                        </MotiView>
                        <MotiView
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            delay={200}
                        >
                            <Text className="text-3xl font-extrabold tracking-tight text-text-main-light dark:text-text-main-dark mb-2 text-center">
                                Payment Successful!
                            </Text>
                            <Text className="text-text-sub-light dark:text-text-sub-dark text-base text-center">
                                You're all set for your session.
                            </Text>
                        </MotiView>
                    </View>

                    {/* Booking Confirmation Card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        delay={400}
                        className="bg-surface-light dark:bg-surface-dark rounded-[32px] p-5 shadow-lg mb-6 border border-gray-100 dark:border-white/5"
                    >
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                                <MaterialIcons name="check" size={12} color="white" />
                            </View>
                            <Text className="text-green-500 text-sm font-semibold tracking-wide uppercase">Your session is confirmed</Text>
                        </View>

                        <View className="flex-row items-center gap-4 mb-5 border-b border-gray-100 dark:border-white/5 pb-5">
                            <View className="relative h-14 w-14 flex-shrink-0">
                                <Image
                                    source={{ uri: therapistAvatar }}
                                    className="h-full w-full rounded-full border border-gray-200 dark:border-white/10"
                                />
                                <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-surface-dark" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{therapistName}</Text>
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-sm">Clinical Psychologist</Text>
                            </View>
                        </View>

                        <View className="flex-col gap-3">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="calendar-today" size={20} color="#30bae8" />
                                    <Text className="text-sm font-medium text-text-sub-light dark:text-text-sub-dark">{formattedDate}</Text>
                                </View>
                                <View className="h-1 w-1 rounded-full bg-gray-400" />
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="schedule" size={20} color="#30bae8" />
                                    <Text className="text-sm font-medium text-text-sub-light dark:text-text-sub-dark">{formattedTime}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center justify-between mt-1">
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="hourglass-empty" size={20} color="#30bae8" />
                                    <Text className="text-sm font-medium text-text-sub-light dark:text-text-sub-dark">45 Mins</Text>
                                </View>
                                <View className="bg-gray-100 dark:bg-background-dark px-3 py-1 rounded-full border border-gray-200 dark:border-white/5">
                                    <Text className="text-xs font-mono text-gray-500 dark:text-gray-400">#{appointmentId?.substring(0, 6).toUpperCase()}</Text>
                                </View>
                            </View>
                        </View>
                    </MotiView>

                    {/* Payment Receipt Card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        delay={500}
                        className="bg-surface-light dark:bg-surface-dark rounded-[32px] p-5 shadow-lg mb-6 border border-gray-100 dark:border-white/5"
                    >
                        <View className="flex-row items-end justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
                            <View>
                                <Text className="text-text-sub-light dark:text-text-sub-dark text-xs font-medium mb-1">Total Amount Paid</Text>
                                <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">₹{amount}</Text>
                            </View>
                            <View className="bg-primary/10 px-2 py-1 rounded">
                                <Text className="text-xs font-bold text-primary">PAID</Text>
                            </View>
                        </View>

                        <View className="space-y-3 gap-3 mb-5">
                            <View className="flex-row justify-between text-sm">
                                <Text className="text-text-sub-light dark:text-text-sub-dark">Payment Method</Text>
                                <Text className="text-text-main-light dark:text-text-main-dark font-medium">UPI</Text>
                            </View>
                            <View className="flex-row justify-between text-sm">
                                <Text className="text-text-sub-light dark:text-text-sub-dark">Transaction ID</Text>
                                <Text className="text-text-main-light dark:text-text-main-dark font-medium font-mono text-xs tracking-wider">{transactionId}</Text>
                            </View>
                            <View className="flex-row justify-between text-sm">
                                <Text className="text-text-sub-light dark:text-text-sub-dark">Date & Time</Text>
                                <Text className="text-text-main-light dark:text-text-main-dark font-medium">{formattedDate}, {formattedTime}</Text>
                            </View>
                        </View>

                        <TouchableOpacity className="w-full flex-row items-center justify-center gap-2 border border-primary/30 rounded-xl py-3 active:bg-primary/5">
                            <MaterialIcons name="download" size={18} color="#30bae8" />
                            <Text className="text-primary text-sm font-semibold">Download Receipt</Text>
                        </TouchableOpacity>
                    </MotiView>

                    {/* What's Next */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        delay={600}
                        className="pt-2 px-2"
                    >
                        <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold mb-4">What's Next?</Text>
                        <View className="gap-5">
                            <View className="flex-row gap-4">
                                <View className="h-10 w-10 rounded-full bg-surface-light dark:bg-surface-dark flex items-center justify-center shrink-0">
                                    <MaterialIcons name="mark-chat-read" size={20} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-text-main-light dark:text-text-main-dark text-sm font-semibold">Confirmation sent</Text>
                                    <Text className="text-text-sub-light dark:text-text-sub-dark text-xs mt-0.5">Check your WhatsApp for details.</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-4">
                                <View className="h-10 w-10 rounded-full bg-surface-light dark:bg-surface-dark flex items-center justify-center shrink-0">
                                    <MaterialIcons name="videocam" size={20} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-text-main-light dark:text-text-main-dark text-sm font-semibold">Join the video call</Text>
                                    <Text className="text-text-sub-light dark:text-text-sub-dark text-xs mt-0.5">The link activates 5 mins before session.</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-4">
                                <View className="h-10 w-10 rounded-full bg-surface-light dark:bg-surface-dark flex items-center justify-center shrink-0">
                                    <MaterialIcons name="notifications" size={20} color="#30bae8" />
                                </View>
                                <View>
                                    <Text className="text-text-main-light dark:text-text-main-dark text-sm font-semibold">Reminder set</Text>
                                    <Text className="text-text-sub-light dark:text-text-sub-dark text-xs mt-0.5">We'll notify you 24 hours prior.</Text>
                                </View>
                            </View>
                        </View>
                    </MotiView>
                </ScrollView>

                {/* Sticky Bottom Actions */}
                <View className="absolute bottom-0 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 pt-4 pb-8 z-10 border-t border-gray-100 dark:border-white/5">
                    <View className="gap-3">
                        <View className="flex-row gap-3">
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 border border-gray-300 dark:border-white/20 rounded-full py-3.5 active:bg-gray-100 dark:active:bg-white/5">
                                <MaterialIcons name="calendar-today" size={18} color={isDark ? "white" : "#0f172a"} />
                                <Text className="text-text-main-light dark:text-white text-sm font-semibold">Add to Calendar</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={navigateToAppointment}
                            className="w-full flex-row items-center justify-center gap-2 bg-primary rounded-full py-3.5 shadow-lg shadow-primary/20 active:opacity-90"
                        >
                            <Text className="text-white text-base font-bold">View Appointment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={navigateToHome}
                            className="w-full py-2 items-center"
                        >
                            <Text className="text-text-sub-light dark:text-text-sub-dark text-sm font-medium">Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};
