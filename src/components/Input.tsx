import React from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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

    const borderColor = error
        ? 'border-red-500'
        : isFocused
            ? 'border-primary dark:border-primary-dark'
            : 'border-gray-200 dark:border-gray-700';

    return (
        <View className="mb-4">
            {label && <Text className="mb-2 text-text-main-light dark:text-text-main-dark font-display font-medium">{label}</Text>}
            <View className={`flex-row items-center border rounded-2xl px-4 bg-white dark:bg-gray-800 ${borderColor} ${props.multiline ? 'h-auto py-3' : 'h-14'}`}>
                {leftIcon && (
                    <Icon name={leftIcon} size={20} color={isFocused ? "#30bae8" : "#9ca3af"} style={{ marginRight: 10 }} />
                )}
                <TextInput
                    className={`flex-1 text-text-main-light dark:text-text-main-dark font-display ${props.multiline ? 'min-h-[60px] text-top' : 'h-full'}`}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
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
            </View>
            {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
        </View>
    );
};
