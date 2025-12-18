import React from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotiView } from 'moti';

import { useColorScheme } from '../hooks/useColorScheme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: string;
    rightIcon?: string;
    onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    ...props
}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const { isDark } = useColorScheme();

    const borderColor = error
        ? '#ef4444' // red-500
        : isFocused
            ? '#30bae8' // primary
            : isDark ? '#374151' : '#e5e7eb'; // gray-700 : gray-200

    const errorVariants = {
        initial: { translateX: 0 },
        error: {
            translateX: [0, -10, 10, -10, 0],
            transition: { duration: 400 }
        }
    };

    return (
        <MotiView
            animate={error ? errorVariants.error as any : errorVariants.initial as any}
            style={{ marginBottom: 16 }}
        >
            {label && (
                <MotiView
                    from={{ translateY: 0, scale: 1 }}
                    animate={{
                        translateY: isFocused || value ? -14 : 0,
                        scale: isFocused || value ? 0.85 : 1,
                    }}
                    transition={{ type: 'timing', duration: 200 }}
                >
                    <Text className="mb-2 text-text-main-light dark:text-text-main-dark font-display font-medium">{label}</Text>
                </MotiView>
            )}
            <MotiView
                animate={{
                    borderColor: borderColor,
                    backgroundColor: isFocused
                        ? (isDark ? '#1f2937' : '#f0f9ff')
                        : (isDark ? '#111827' : '#ffffff'),
                }}
                transition={{ type: 'timing', duration: 200 }}
                className={`flex-row items-center border rounded-2xl px-4 ${props.multiline ? 'h-auto py-3' : 'h-14'}`}
                style={{ borderWidth: 1 }}
            >
                {leftIcon && (
                    <MotiView animate={{ scale: isFocused ? 1.1 : 1 }}>
                        <Icon name={leftIcon} size={20} color={isFocused ? "#30bae8" : (isDark ? "#9ca3af" : "#9ca3af")} style={{ marginRight: 10 }} />
                    </MotiView>
                )}
                <TextInput
                    className={`flex-1 text-text-main-light dark:text-text-main-dark font-display ${props.multiline ? 'min-h-[60px] text-top' : 'h-full'}`}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !showPassword}
                    autoCapitalize="none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {secureTextEntry ? (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? "eye-off" : "eye"} size={20} color={isFocused ? "#30bae8" : "#9ca3af"} />
                    </TouchableOpacity>
                ) : rightIcon ? (
                    <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
                        <Icon name={rightIcon} size={20} color={isFocused ? "#30bae8" : "#9ca3af"} />
                    </TouchableOpacity>
                ) : null}
            </MotiView>
            {error && (
                <MotiView from={{ opacity: 0, translateY: -5 }} animate={{ opacity: 1, translateY: 0 }}>
                    <Text className="text-red-500 text-sm mt-1">{error}</Text>
                </MotiView>
            )}
        </MotiView>
    );
};
