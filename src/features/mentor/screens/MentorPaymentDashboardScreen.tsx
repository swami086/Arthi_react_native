import React from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { EarningsCard } from '../../../components/EarningsCard';
import { PaymentCard } from '../../../components/PaymentCard';
import { useMentorEarnings } from '../hooks/useMentorEarnings';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { MotiView } from 'moti';

export const MentorPaymentDashboardScreen = () => {
    const navigation = useNavigation();
    const { earnings, transactions, chartData, loading, refreshing, onRefresh } = useMentorEarnings();
    const { isDark } = useColorScheme();
    const screenWidth = Dimensions.get('window').width;

    const chartConfig = {
        backgroundGradientFrom: isDark ? "#1f2937" : "#ffffff", // darker gray for dark mode
        backgroundGradientTo: isDark ? "#1f2937" : "#ffffff",
        color: (opacity = 1) => `rgba(48, 186, 232, ${opacity})`,
        strokeWidth: 3, // thicker line
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
        labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#30bae8"
        },
        propsForBackgroundLines: {
            strokeDasharray: "", // solid lines
            stroke: isDark ? "#374151" : "#e5e7eb", // visible grid lines
            strokeWidth: 1,
            strokeOpacity: 0.2
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="mr-2 p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} className="text-gray-900 dark:text-white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Earnings & Payouts</Text>
            </View>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#30bae8" />
                }
            >
                <View className="p-4">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Overview</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        <EarningsCard
                            title="Total Earnings"
                            amount={earnings.total}
                            trend={12}
                            icon="cash-multiple"
                            color="#30bae8"
                            delay={0}
                        />
                        <EarningsCard
                            title="This Month"
                            amount={earnings.thisMonth}
                            trend={5}
                            icon="calendar-month"
                            color="#16a34a"
                            delay={100}
                        />
                        <EarningsCard
                            title="Pending Payout"
                            amount={earnings.pending}
                            icon="clock-outline"
                            color="#ca8a04"
                            delay={200}
                        />
                    </ScrollView>

                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        delay={300}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6"
                    >
                        <Text className="text-gray-900 dark:text-white font-bold text-lg mb-4">Earnings Trend</Text>
                        {chartData.data.length > 0 ? (
                            <LineChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [{ data: chartData.data }]
                                }}
                                width={screenWidth - 64}
                                height={220}
                                chartConfig={chartConfig}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16
                                }}
                            />
                        ) : (
                            <View className="h-40 items-center justify-center">
                                <Text className="text-gray-400">No data available</Text>
                            </View>
                        )}
                    </MotiView>

                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</Text>
                        <TouchableOpacity onPress={() => { }}>
                            <Text className="text-primary dark:text-primary-dark font-bold">See All</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.map((payment) => (
                        <PaymentCard key={payment.id} payment={payment} />
                    ))}

                    {transactions.length === 0 && !loading && (
                        <View className="items-center py-8">
                            <Text className="text-gray-500">No transactions yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
