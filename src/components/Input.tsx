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

    // Enhance focus states: focus:ring-2 focus:ring-primary/20 focus:border-primary
    // Update border styling
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
                <MotiView>
                    {/* Improve label styling: text-xs font-bold uppercase tracking-wider */}
                    <Text className="mb-2 text-text-sub-light dark:text-text-sub-dark text-xs font-bold uppercase tracking-wider font-sans">{label}</Text>
                </MotiView>
            )}
            <MotiView
                animate={{
                    borderColor: borderColor,
                    backgroundColor: isFocused
                        ? (isDark ? '#1a2c32' : '#ffffff') // surface
                        : (isDark ? '#111d21' : '#f8fbfc'), // background
                    borderWidth: isFocused ? 2 : 1,
                    scale: 1,
                }}
                transition={{ type: 'timing', duration: 200 }}
                // Refine border radius to rounded-2xl
                // Update padding to accommodate left icons (pl-11 via absolute position or padding)
                className={`relative flex-row items-center rounded-2xl ${props.multiline ? 'h-auto py-3' : 'h-14'} ${leftIcon ? 'pl-11' : 'px-4'}`}
            >
                {/* Add left icon support with Material Symbols positioned absolutely */}
                {leftIcon && (
                    <View className="absolute left-4 z-10">
                        <MotiView animate={{ scale: isFocused ? 1.1 : 1 }}>
                            <Icon name={leftIcon} size={22} color={isFocused ? "#30bae8" : (isDark ? "#94aeb8" : "#4e8597")} />
                        </MotiView>
                    </View>
                )}

                <TextInput
                    className={`flex-1 text-text-main-light dark:text-text-main-dark font-sans text-base ${props.multiline ? 'min-h-[60px] text-top' : 'h-full'}`}
                    placeholder={placeholder}
                    // Enhance placeholder text color for better visibility
                    placeholderTextColor={isDark ? "#94aeb8" : "#9ca3af"}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !showPassword}
                    autoCapitalize="none"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {secureTextEntry ? (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-2">
                        <Icon name={showPassword ? "eye-off" : "eye"} size={22} color={isFocused ? "#30bae8" : "#94aeb8"} />
                    </TouchableOpacity>
                ) : rightIcon ? (
                    <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress} className="px-2">
                        <Icon name={rightIcon} size={22} color={isFocused ? "#30bae8" : "#94aeb8"} />
                    </TouchableOpacity>
                ) : null}
            </MotiView>
            {error && (
                <MotiView from={{ opacity: 0, translateY: -5 }} animate={{ opacity: 1, translateY: 0 }}>
                    <Text className="text-error text-sm mt-1 ml-1">{error}</Text>
                </MotiView>
            )}
        </MotiView>
    );
};
