import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../../components/Button';
import { PaymentCard } from '../../../components/PaymentCard';
import { FilterChip } from '../../../components/FilterChip';
import { usePaymentHistory } from '../hooks/usePaymentHistory';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const PaymentHistoryScreen = () => {
    const navigation = useNavigation();
    const { payments, loading, refreshing, onRefresh } = usePaymentHistory();
    const [activeFilter, setActiveFilter] = React.useState('All');

    const filters = ['All', 'Completed', 'Pending', 'Failed'];

    const filteredPayments = payments.filter(p => {
        if (activeFilter === 'All') return true;
        return p.status === activeFilter.toLowerCase();
    });

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
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Payment History</Text>
            </View>

            <View className="py-4 px-4 border-b border-gray-100 dark:border-gray-800">
                <FlatList
                    horizontal
                    data={filters}
                    keyExtractor={item => item}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <FilterChip
                            label={item}
                            isSelected={activeFilter === item}
                            onPress={() => setActiveFilter(item)}
                        />
                    )}
                />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#30bae8" />
                </View>
            ) : (
                <FlatList
                    data={filteredPayments}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <PaymentCard payment={item} />
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <MaterialCommunityIcons name="history" size={64} color="#9ca3af" />
                            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                                No payments found
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};
