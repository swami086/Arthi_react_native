import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminDashboardScreen } from '../features/admin/screens/AdminDashboardScreen';
import { AdminMentorsScreen } from '../features/admin/screens/AdminMentorsScreen';
import { AdminMenteesScreen } from '../features/admin/screens/AdminMenteesScreen';
import { ManageAdminsScreen } from '../features/admin/screens/ManageAdminsScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const AdminNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4e8597',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
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
                name="Mentors"
                component={AdminMentorsScreen}
                options={{
                    tabBarLabel: 'Mentors',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-tie" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Mentees"
                component={AdminMenteesScreen}
                options={{
                    tabBarLabel: 'Mentees',
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
