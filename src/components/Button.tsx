import React, { useState } from 'react';
import { Text, ActivityIndicator, View, Pressable } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
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
    const [pressed, setPressed] = useState(false);

    // Refined border radius to rounded-full
    const baseClasses = "py-4 px-6 rounded-full flex-row justify-center items-center shadow-sm overflow-hidden";
    let variantClasses = "";
    // Enhanced text sizing: primary buttons use text-lg font-bold
    let baseTextClasses = "font-sans text-lg font-bold";
    let iconColor = "#ffffff";

    switch (variant) {
        case 'primary':
            // Update primary button styling with enhanced shadow
            variantClasses = "bg-primary dark:bg-primary-dark shadow-lg shadow-primary/30";
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

    const handlePress = () => {
        if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    return (
        <MotiView
            // Improve hover and active states with scale transforms
            animate={{ scale: pressed ? 0.98 : 1, opacity: pressed ? 0.9 : 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{ width: '100%' }}
        >
            <Pressable
                onPress={handlePress}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                disabled={disabled || loading}
                className={`${baseClasses} ${variantClasses} ${className}`}
            >
                {loading ? (
                    // Enhance loading state with better spinner animation
                    <MotiView
                        from={{ rotate: '0deg', scale: 1 }}
                        animate={{ rotate: '360deg', scale: 1.2 }}
                        transition={{ loop: true, type: 'timing', duration: 1000 }}
                    >
                        <ActivityIndicator color={iconColor} size="small" />
                    </MotiView>
                ) : (
                    <View className="flex-row items-center">
                        {icon && iconPosition === 'left' && (
                            <Icon name={icon} size={24} color={iconColor} style={{ marginRight: 8 }} />
                        )}
                        <Text className={`${baseTextClasses} ${textClassName}`}>{title}</Text>
                        {icon && iconPosition === 'right' && (
                            <Icon name={icon} size={24} color={iconColor} style={{ marginLeft: 8 }} />
                        )}
                    </View>
                )}
            </Pressable>
        </MotiView>
    );
};
