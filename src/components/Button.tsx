import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'transparent';
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    className = "",
    textClassName = "",
    icon,
    iconPosition = 'left',
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
        }).start();
    };

    const baseClasses = "py-4 px-6 rounded-2xl flex-row justify-center items-center shadow-sm";
    let variantClasses = "";
    let baseTextClasses = "font-display font-bold text-base";
    let iconColor = "#ffffff";

    switch (variant) {
        case 'primary':
            variantClasses = "bg-primary dark:bg-primary-dark shadow-lg shadow-blue-500/30";
            baseTextClasses += " text-white";
            iconColor = "#ffffff";
            break;
        case 'secondary':
        case 'outline':
            variantClasses = "bg-transparent border-2 border-primary dark:border-primary-dark";
            baseTextClasses += " text-primary dark:text-primary-dark";
            iconColor = "#30bae8";
            break;
        case 'ghost':
        case 'transparent':
            variantClasses = "bg-transparent shadow-none";
            baseTextClasses += " text-primary dark:text-primary-dark";
            iconColor = "#30bae8";
            break;
    }

    if (disabled) {
        variantClasses += " opacity-50";
    }

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.9}
                className={`${baseClasses} ${variantClasses} ${className}`}
            >
                {loading ? (
                    <ActivityIndicator color={iconColor} />
                ) : (
                    <View className="flex-row items-center">
                        {icon && iconPosition === 'left' && (
                            <Icon name={icon} size={20} color={iconColor} style={{ marginRight: 8 }} />
                        )}
                        <Text className={`${baseTextClasses} ${textClassName}`}>{title}</Text>
                        {icon && iconPosition === 'right' && (
                            <Icon name={icon} size={20} color={iconColor} style={{ marginLeft: 8 }} />
                        )}
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};
