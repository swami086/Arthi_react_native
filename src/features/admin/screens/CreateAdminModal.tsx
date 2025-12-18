import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { createAdmin } from '../../../api/adminService';

export const CreateAdminModal = () => {
    const navigation = useNavigation<any>();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // NOTE: This is client-side implementation. Real admin creation usually involves
    // inviting via email or server-side auth creation.
    const handleCreate = async () => {
        if (!fullName || !email) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            // Mocking the creation or calling the partially implemented service
            await createAdmin(email, fullName);
            Alert.alert("Success", "Invitation sent to " + email, [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800">
                <Text className="text-xl font-bold text-text-main-light dark:text-white">New Admin</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6">
                    <Text className="text-blue-800 dark:text-blue-300 text-sm leading-5">
                        <Text className="font-bold">Note:</Text> Creating a new admin will grant them full access to the dashboard, including mentor approvals and mentee management.
                    </Text>
                </View>

                <View className="space-y-4">
                    <Input
                        label="Full Name"
                        placeholder="Admin Name"
                        value={fullName}
                        onChangeText={setFullName}
                        leftIcon="account"
                    />
                    <Input
                        label="Email Address"
                        placeholder="admin@safespace.com"
                        value={email}
                        onChangeText={setEmail}
                        leftIcon="email"
                        keyboardType="email-address"
                    />

                    {/* Role Selection could go here if supporting Super Admins */}
                </View>

                <Button
                    title="Send Invitation"
                    onPress={handleCreate}
                    loading={loading}
                    className="mt-8"
                    icon="email-send"
                />
            </ScrollView>
        </SafeAreaView>
    );
};
