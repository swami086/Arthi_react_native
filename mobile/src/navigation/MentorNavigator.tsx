import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TherapistHomeScreen from '../features/mentor/screens/TherapistHomeScreen';
import PatientsScreen from '../features/mentor/screens/PatientsScreen';
import TherapistSessionsScreen from '../features/mentor/screens/TherapistSessionsScreen';
import TherapistProfileScreen from '../features/mentor/screens/TherapistProfileScreen';
import SettingsScreen from '../features/profile/screens/SettingsScreen';
import { TherapistTabParamList } from './types';
import { useColorScheme } from '../hooks/useColorScheme';
import { tokens } from '../design-system/tokens';

const Tab = createBottomTabNavigator<TherapistTabParamList>();

export const TherapistNavigator = () => {
    const { isDark } = useColorScheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: tokens.colors.primary.light,
                tabBarInactiveTintColor: isDark ? tokens.colors.text.disabled.dark : tokens.colors.text.disabled.light,
                tabBarStyle: {
                    backgroundColor: isDark ? tokens.colors.surface.dark : tokens.colors.surface.light,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? tokens.colors.border.dark : tokens.colors.border.light,
                    height: 60,
                    paddingBottom: tokens.spacing[2],
                    paddingTop: tokens.spacing[2],
                },
                tabBarLabelStyle: {
                    fontFamily: tokens.typography.fontFamily.primary,
                    fontWeight: '600',
                    fontSize: tokens.typography.fontSize.xs,
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={TherapistHomeScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Patients"
                component={PatientsScreen}
                options={{
                    tabBarLabel: 'Patients',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Sessions"
                component={TherapistSessionsScreen}
                options={{
                    tabBarLabel: 'Sessions',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="calendar-clock" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={TherapistProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-circle" color={color} size={size} />
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
