import React, { useState } from 'react';
import { Text, ActivityIndicator, View, Pressable } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { tokens } from '../design-system/tokens';

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
    size?: 'sm' | 'md' | 'lg';
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
    size = 'md',
}) => {
    const [pressed, setPressed] = useState(false);

    // Size variants
    const sizeClasses = {
        sm: "py-2 px-4 min-h-[32px]",
        md: "py-3 px-6 min-h-[48px]",
        lg: "py-4 px-8 min-h-[56px]",
    }[size];

    const textSizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    }[size];

    const baseClasses = `rounded-full flex-row justify-center items-center overflow-hidden ${sizeClasses}`;

    let variantClasses = "";
    let baseTextClasses = `font-primary font-bold ${textSizeClasses}`;
    let iconColor = tokens.colors.surface.light;

    switch (variant) {
        case 'primary':
            variantClasses = "bg-primary dark:bg-primary-dark shadow-elevated";
            baseTextClasses += " text-text-inverse dark:text-text-inverse-dark";
            iconColor = tokens.colors.surface.light;
            break;
        case 'secondary':
            variantClasses = "bg-secondary dark:bg-secondary-dark shadow-soft";
            baseTextClasses += " text-white";
            iconColor = tokens.colors.surface.light;
            break;
        case 'outline':
            variantClasses = "bg-transparent border-2 border-primary dark:border-primary-dark";
            baseTextClasses += " text-primary dark:text-primary-dark";
            iconColor = tokens.colors.primary.light;
            break;
        case 'ghost':
        case 'transparent':
            variantClasses = "bg-transparent shadow-none";
            baseTextClasses += " text-primary dark:text-primary-dark";
            iconColor = tokens.colors.primary.light;
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
                    <MotiView
                        from={{ rotate: '0deg', scale: 1 }}
                        animate={{ rotate: '360deg', scale: 1.2 }}
                        transition={{ loop: true, type: 'timing', duration: 1000 }}
                    >
                        <ActivityIndicator color={iconColor} size="small" />
                    </MotiView>
                ) : (
                    <View className="flex-row items-center gap-2">
                        {icon && iconPosition === 'left' && (
                            <Icon name={icon} size={size === 'sm' ? 16 : 20} color={iconColor} />
                        )}
                        <Text className={`${baseTextClasses} ${textClassName}`}>{title}</Text>
                        {icon && iconPosition === 'right' && (
                            <Icon name={icon} size={size === 'sm' ? 16 : 20} color={iconColor} />
                        )}
                    </View>
                )}
            </Pressable>
        </MotiView>
    );
};
