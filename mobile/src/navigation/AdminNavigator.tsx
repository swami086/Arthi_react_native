import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminDashboardScreen } from '../features/admin/screens/AdminDashboardScreen';
import { AdminTherapistsScreen } from '../features/admin/screens/AdminTherapistsScreen';
import { AdminPatientsScreen } from '../features/admin/screens/AdminPatientsScreen';
import { ManageAdminsScreen } from '../features/admin/screens/ManageAdminsScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import { AdminTabParamList } from './types';
import { useColorScheme } from '../hooks/useColorScheme';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminNavigator = () => {
    const { isDark } = useColorScheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#30bae8',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: isDark ? '#1a2c32' : '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: isDark ? '#1a2c32' : '#f0f0f0',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={AdminDashboardScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Therapists"
                component={AdminTherapistsScreen}
                options={{
                    tabBarLabel: 'Therapists',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-tie" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Patients"
                component={AdminPatientsScreen}
                options={{
                    tabBarLabel: 'Patients',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-school" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Admins"
                component={ManageAdminsScreen}
                options={{
                    tabBarLabel: 'Admins',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="shield-account" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="cog" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
