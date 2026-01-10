import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/screens/HomeScreen';
import TherapistsScreen from '../features/mentors/screens/TherapistsScreen';
import { AppointmentsScreen } from '../features/appointments/screens/AppointmentsScreen';
import MessagesScreen from '../features/messages/screens/MessagesScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { MainTabParamList } from './types';
import { TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColorScheme } from '../hooks/useColorScheme';
import { tokens } from '../design-system/tokens';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
    const { isDark } = useColorScheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: tokens.colors.primary.light,
                tabBarInactiveTintColor: isDark ? tokens.colors.text.disabled.dark : tokens.colors.text.disabled.light,
                tabBarStyle: {
                    backgroundColor: isDark ? tokens.colors.surface.dark : tokens.colors.surface.light,
                    borderTopColor: isDark ? tokens.colors.border.dark : tokens.colors.border.light,
                },
                tabBarLabelStyle: {
                    fontFamily: tokens.typography.fontFamily.primary,
                    fontWeight: '600',
                    fontSize: tokens.typography.fontSize.xxs,
                    marginBottom: 4,
                },
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName = 'circle';

                    if (route.name === 'Home') iconName = 'home-outline';
                    else if (route.name === 'Therapists') iconName = 'account-search-outline';
                    else if (route.name === 'Appointments') iconName = 'calendar-outline';
                    else if (route.name === 'Messages') iconName = 'message-outline';
                    else if (route.name === 'Profile') iconName = 'account-outline';

                    return (
                        <Icon name={iconName} size={size} color={color} />
                    );
                },
                tabBarButton: (props) => {
                    const {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        delayLongPress,
                        disabled,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onBlur,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onFocus,
                        onLongPress,
                        onPressIn,
                        onPressOut,
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ref,
                        ...rest
                    } = props;
                    return (
                        <TouchableOpacity
                            {...rest}
                            ref={ref as any}
                            disabled={disabled || undefined}
                            onLongPress={onLongPress || undefined}
                            onPressIn={onPressIn || undefined}
                            onPressOut={onPressOut || undefined}
                            onPress={(e) => {
                                if (props.onPress) {
                                    props.onPress(e);
                                    Haptics.selectionAsync();
                                }
                            }}
                        />
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Therapists" component={TherapistsScreen} />
            <Tab.Screen name="Appointments" component={AppointmentsScreen} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};
