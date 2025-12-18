import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MentorHomeScreen from '../features/mentor/screens/MentorHomeScreen';
import MenteesScreen from '../features/mentor/screens/MenteesScreen';
import MentorSessionsScreen from '../features/mentor/screens/MentorSessionsScreen';
import { MentorProfileScreen } from '../features/mentor/screens/MentorProfileScreen';
import { MentorTabParamList } from './types';
import { useColorScheme } from '../hooks/useColorScheme';

const Tab = createBottomTabNavigator<MentorTabParamList>();

export const MentorNavigator = () => {
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
                name="Home"
                component={MentorHomeScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Mentees"
                component={MenteesScreen}
                options={{
                    tabBarLabel: 'Mentees',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Sessions"
                component={MentorSessionsScreen}
                options={{
                    tabBarLabel: 'Sessions',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="calendar-clock" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={MentorProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-circle" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
