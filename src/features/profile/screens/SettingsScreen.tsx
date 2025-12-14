import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../auth/hooks/useAuth';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { signOut } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

    const menuItems = [
        {
            icon: 'account-circle-outline',
            title: 'Account Settings',
            subtitle: 'Manage your profile and subscription',
            action: () => { }
        },
        {
            icon: 'bell-outline',
            title: 'Notifications',
            subtitle: 'Customize your alerts',
            toggle: true,
            value: notificationsEnabled,
            onValueChange: setNotificationsEnabled
        },
        {
            icon: 'shield-lock-outline',
            title: 'Privacy & Security',
            subtitle: 'Password, FaceID, and more',
            action: () => { }
        },
        {
            icon: 'theme-light-dark',
            title: 'Dark Mode',
            subtitle: 'Switch to dark theme',
            toggle: true,
            value: darkModeEnabled,
            onValueChange: setDarkModeEnabled
        },
        {
            icon: 'help-circle-outline',
            title: 'Help & Support',
            subtitle: 'FAQs and contact support',
            action: () => { }
        }
    ];

    const renderMenuItem = (item: any, index: number) => (
        <TouchableOpacity
            key={index}
            className="flex-row items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50"
            onPress={item.action}
            disabled={!!item.toggle}
        >
            <View className="flex-row items-center flex-1">
                <View className="bg-gray-50 p-2 rounded-full mr-4">
                    <MaterialCommunityIcons name={item.icon} size={24} color="#30bae8" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-900 font-semibold text-base">{item.title}</Text>
                    <Text className="text-gray-500 text-xs">{item.subtitle}</Text>
                </View>
            </View>
            {item.toggle ? (
                <Switch
                    trackColor={{ false: "#e0e0e0", true: "#b0e0f5" }}
                    thumbColor={item.value ? "#30bae8" : "#f4f3f4"}
                    ios_backgroundColor="#e0e0e0"
                    onValueChange={item.onValueChange}
                    value={item.value}
                />
            ) : (
                <MaterialCommunityIcons name="chevron-right" size={24} color="#bdbdbd" />
            )}
        </TouchableOpacity>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: 'transparent' }}>
            <BlurView intensity={20} tint="dark" className="absolute inset-0 z-0" />

            <View className="flex-1 mt-20 bg-white rounded-t-3xl shadow-2xl overflow-hidden">
                {/* Drag Handle */}
                <View className="items-center py-3 border-b border-gray-50">
                    <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </View>

                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center">
                    <Text className="text-2xl font-bold text-gray-900">Settings</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} className="bg-gray-100 p-2 rounded-full">
                        <MaterialCommunityIcons name="close" size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Menu */}
                <View className="flex-1">
                    {menuItems.map((item, index) => renderMenuItem(item, index))}
                </View>

                <View className="p-6 pb-12 border-t border-gray-100">
                    <TouchableOpacity
                        className="flex-row items-center justify-center bg-red-50 py-4 rounded-xl border border-red-100"
                        onPress={async () => {
                            await signOut();
                            navigation.goBack();
                        }}
                    >
                        <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
                        <Text className="ml-2 text-red-500 font-bold text-base">Log Out</Text>
                    </TouchableOpacity>
                    <Text className="text-center text-gray-400 text-xs mt-4">Version 1.0.0 (Build 45)</Text>
                </View>
            </View>
        </View>
    );
};

export default SettingsScreen;
