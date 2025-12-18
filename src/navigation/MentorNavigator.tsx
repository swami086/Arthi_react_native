import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MentorHomeScreen from '../features/mentor/screens/MentorHomeScreen';
import MenteesScreen from '../features/mentor/screens/MenteesScreen';
import MentorSessionsScreen from '../features/mentor/screens/MentorSessionsScreen';
import { MentorProfileScreen } from '../features/mentor/screens/MentorProfileScreen';
import { MentorTabParamList } from './types';

const Tab = createBottomTabNavigator<MentorTabParamList>();

export const MentorNavigator = () => {
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
