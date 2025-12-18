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

    const handlePress = () => {
        if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    return (
        <MotiView
            animate={{ scale: pressed ? 0.95 : 1, opacity: pressed ? 0.8 : 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
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
                    <MotiView
                        from={{ rotate: '0deg' }}
                        animate={{ rotate: '360deg' }}
                        transition={{ loop: true, type: 'timing', duration: 1000 }}
                    >
                        <ActivityIndicator color={iconColor} />
                    </MotiView>
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
            </Pressable>
        </MotiView>
    );
};
