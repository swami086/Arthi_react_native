import React, { useState, useMemo } from 'react';
import { View, Text, SectionList, StatusBar, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';
import { AddSessionModal } from './AddSessionModal';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../auth/context/AuthContext';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { withRollbarPerformance } from '../../../services/rollbar';
import { MotiView, AnimatePresence } from 'moti';
import { tokens } from '../../../design-system/tokens';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { ListSkeleton } from '../../../components/LoadingSkeleton';

const { width } = Dimensions.get('window');

// Figma Assets based on Node 2:674
const FIGMA_ASSETS = {
    avatar: "http://localhost:3845/assets/59b60e4638c740f408cf0733abf9ffa8bdb9718f.png",
    patient1: "http://localhost:3845/assets/7103c235af4cc34d7f3959a4ca31967f172abfd2.png",
    patient2: "http://localhost:3845/assets/4223cd475ca66e463b2fe2d012226ea24ade734b.png",
    patient3: "http://localhost:3845/assets/37964c109eade064f21d5ebb026d9eef0c99890b.png",
    patient4: "http://localhost:3845/assets/650c2217681ff7ec466929dea9bbd32b84d165ad.png",
};

const CustomSessionCard = ({ item, onPress }: { item: any, onPress: () => void }) => {
    const patientName = item.patient?.full_name || 'Patient';
    const status = item.status || 'pending';

    const getAccentColor = () => {
        if (status === 'pending') return '#F59E0B';
        if (status === 'confirmed') return '#3B82F6';
        if (status === 'completed') return '#10B981';
        return '#6B7280';
    };

    const accent = getAccentColor();
    const duration = Math.round((new Date(item.end_time).getTime() - new Date(item.start_time).getTime()) / 60000);

    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400 }}
        >
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.9}
                className="mb-8 rounded-[32px] overflow-hidden bg-[#1a2121] flex-row shadow-2xl"
                style={{ shadowColor: accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }}
            >
                {/* Accent bar */}
                <View style={{ width: 8, backgroundColor: accent, borderTopRightRadius: 8, borderBottomRightRadius: 8 }} />

                <View className="flex-1 p-6 pr-2">
                    <View className="flex-row justify-between items-start mb-3">
                        <View>
                            <Text className="text-gray-400 text-[10px] font-bold tracking-[2px] uppercase mb-1">{status}</Text>
                            <Text className="text-white text-2xl font-bold">Session</Text>
                            <View className="flex-row items-center mt-2">
                                <Icon name="clock" size={12} color={accent} />
                                <Text className="text-gray-400 text-xs ml-1 font-medium">
                                    {new Date(item.start_time).toLocaleDateString()} • {duration} min
                                </Text>
                            </View>
                        </View>
                        <View className="bg-[#243333] px-3 py-1.5 rounded-lg">
                            <Text className="text-[10px] font-bold tracking-widest" style={{ color: accent }}>{status.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View className="h-[1px] bg-[#2a3737] w-full my-4" />

                    <View className="flex-row items-center mb-6">
                        <View className="w-9 h-9 rounded-full bg-[#3B82F6] items-center justify-center mr-3 overflow-hidden border-2 border-[#1a2121]">
                            <Image
                                source={{ uri: item.patient?.avatar_url || FIGMA_ASSETS.patient1 }}
                                className="w-full h-full"
                            />
                        </View>
                        <Text className="text-white text-base font-semibold">with Patient {patientName.split(' ')[0]}</Text>
                    </View>

                    <TouchableOpacity
                        className="bg-[#2a3737] self-start px-5 py-2.5 rounded-2xl flex-row items-center border border-white/5"
                        onPress={onPress}
                    >
                        <Text className="text-white font-bold text-sm mr-2">
                            {status === 'pending' ? 'Confirm' : status === 'confirmed' ? 'Join Session' : 'Reschedule'}
                        </Text>
                        {status === 'confirmed' ? (
                            <MaterialIcon name="videocam" size={16} color="white" />
                        ) : status === 'pending' ? (
                            <Icon name="check" size={16} color="white" />
                        ) : (
                            <Icon name="calendar" size={16} color="white" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Patient Image on Right */}
                <View className="w-32 h-32 mr-4 rounded-3xl overflow-hidden self-center border-4 border-[#243333] shadow-lg">
                    <Image
                        source={{ uri: item.patient?.avatar_url || FIGMA_ASSETS.patient2 }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>
            </TouchableOpacity>
        </MotiView>
    );
};

function TherapySessionsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const { isDark } = useColorScheme();
    const { appointments, loading, error, refetch } = useAppointments();
    const [filter, setFilter] = useState<'All' | 'Upcoming'>('All');
    const [showAddModal, setShowAddModal] = useState(false);

    const sections = useMemo(() => {
        const filtered = filter === 'All' ? appointments : appointments.filter(a => new Date(a.start_time) > new Date());

        return [
            {
                title: 'Pending',
                data: filtered.filter(a => a.status === 'pending'),
            },
            {
                title: 'Confirmed',
                data: filtered.filter(a => a.status === 'confirmed'),
            },
            {
                title: 'Past',
                data: filtered.filter(a => a.status === 'completed' || a.status === 'cancelled' || (new Date(a.start_time) < new Date() && a.status === 'confirmed')),
            }
        ].filter(s => s.data.length > 0);
    }, [appointments, filter]);

    return (
        <View className="flex-1 bg-[#121717]">
            <StatusBar barStyle="light-content" />
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <View className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10">
                        <Image source={{ uri: FIGMA_ASSETS.avatar }} className="w-full h-full" />
                    </View>
                    <Text className="text-2xl font-bold text-white">Sessions</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Settings' as any)}
                        className="w-12 h-12 items-center justify-center bg-[#1a2121] rounded-2xl border border-white/5"
                    >
                        <Icon name="settings" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="px-6 mt-4">
                    <View className="bg-[#1a2121] p-1.5 rounded-[20px] flex-row border border-white/5">
                        <TouchableOpacity
                            onPress={() => setFilter('All')}
                            className={`flex-1 py-3 rounded-[16px] items-center ${filter === 'All' ? 'bg-[#2a3737] shadow-lg' : ''}`}
                        >
                            <Text className={`font-bold ${filter === 'All' ? 'text-white' : 'text-gray-500'}`}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilter('Upcoming')}
                            className={`flex-1 py-3 rounded-[16px] items-center ${filter === 'Upcoming' ? 'bg-[#2a3737] shadow-lg' : ''}`}
                        >
                            <Text className={`font-bold ${filter === 'Upcoming' ? 'text-white' : 'text-gray-500'}`}>Upcoming</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {error && (
                    <View className="px-6 mt-4">
                        <ErrorBanner message={error} visible={!!error} onRetry={refetch} />
                    </View>
                )}

                {loading ? (
                    <View className="px-6 flex-1 mt-8">
                        <ListSkeleton count={3} />
                    </View>
                ) : appointments.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <MotiView
                            from={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#1a2121] p-10 rounded-full"
                        >
                            <Icon name="calendar" size={60} color="#2a3737" />
                        </MotiView>
                        <Text className="text-gray-500 text-lg mt-6 font-medium">No sessions found</Text>
                        <TouchableOpacity
                            onPress={() => setShowAddModal(true)}
                            className="mt-4 bg-[#30bae8] px-8 py-3 rounded-2xl"
                        >
                            <Text className="text-white font-bold">Add Your First Session</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <SectionList
                        sections={sections}
                        keyExtractor={(item) => item.id}
                        renderSectionHeader={({ section: { title } }) => (
                            <MotiView
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                className="px-6 pt-8 pb-4"
                            >
                                <Text className="text-white text-2xl font-bold tracking-tight">{title}</Text>
                            </MotiView>
                        )}
                        renderItem={({ item }) => (
                            <View className="px-6">
                                <CustomSessionCard
                                    item={item}
                                    onPress={() => navigation.navigate('SessionDetail', { appointmentId: item.id })}
                                />
                            </View>
                        )}
                        stickySectionHeadersEnabled={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>

            {/* Premium FAB */}
            <TouchableOpacity
                className="absolute bottom-8 right-8 bg-[#30bae8] w-16 h-16 rounded-[24px] items-center justify-center shadow-2xl"
                style={{
                    elevation: 10,
                    zIndex: 100,
                    shadowColor: '#30bae8',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.4,
                    shadowRadius: 15
                }}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.8}
            >
                <Icon name="plus" size={32} color="white" />
            </TouchableOpacity>

            <AddSessionModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => refetch()}
                therapistId={user?.id || ''}
            />
        </View>
    );
};

export default withRollbarPerformance(TherapySessionsScreen, 'TherapySessions');
