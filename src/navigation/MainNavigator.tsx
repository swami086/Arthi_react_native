import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { MentorsScreen } from '../features/mentors/screens/MentorsScreen';
import { AppointmentsScreen } from '../features/appointments/screens/AppointmentsScreen';
import { MessagesScreen } from '../features/messages/screens/MessagesScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { MainTabParamList } from './types';
import { TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#30bae8',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName = 'circle';

                    if (route.name === 'Home') iconName = 'home-outline';
                    else if (route.name === 'Mentors') iconName = 'account-search-outline';
                    else if (route.name === 'Appointments') iconName = 'calendar-outline';
                    else if (route.name === 'Messages') iconName = 'message-outline';
                    else if (route.name === 'Profile') iconName = 'account-outline';

                    return (
                        <MotiView
                            from={{ scale: 1 }}
                            animate={{ scale: focused ? 1.2 : 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                            <Icon name={iconName} size={size} color={color} />
                        </MotiView>
                    );
                },
                tabBarButton: (props) => (
                    <TouchableOpacity
                        {...props}
                        onPress={(e) => {
                            if (props.onPress) {
                                props.onPress(e);
                                Haptics.selectionAsync();
                            }
                        }}
                    />
                ),
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Mentors" component={MentorsScreen} />
            <Tab.Screen name="Appointments" component={AppointmentsScreen} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};
