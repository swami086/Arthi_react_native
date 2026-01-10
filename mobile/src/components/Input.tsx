import React from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotiView } from 'moti';
import { useColorScheme } from '../hooks/useColorScheme';
import { tokens } from '../design-system/tokens';

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
        ? tokens.colors.status.error
        : isFocused
            ? tokens.colors.primary.light
            : isDark ? tokens.colors.border.dark : tokens.colors.border.light;

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
            style={{ marginBottom: tokens.spacing[4] }}
        >
            {label && (
                <MotiView>
                    <Text className="mb-2 text-text-secondary dark:text-text-secondary-dark text-xs font-bold uppercase tracking-wider font-primary">{label}</Text>
                </MotiView>
            )}
            <MotiView
                animate={{
                    borderColor: borderColor,
                    backgroundColor: isFocused
                        ? (isDark ? tokens.colors.surface.dark : tokens.colors.surface.light)
                        : (isDark ? tokens.colors.background.dark : tokens.colors.background.light),
                    borderWidth: isFocused ? 2 : 1,
                    scale: 1,
                }}
                transition={{ type: 'timing', duration: 200 }}
                className={`relative flex-row items-center rounded-xl ${props.multiline ? 'h-auto py-3' : 'h-14'} ${leftIcon ? 'pl-11' : 'px-4'}`}
            >
                {leftIcon && (
                    <View className="absolute left-4 z-10">
                        <MotiView animate={{ scale: isFocused ? 1.1 : 1 }}>
                            <Icon name={leftIcon} size={tokens.dimensions.icon.md} color={isFocused ? tokens.colors.primary.light : (isDark ? tokens.colors.text.secondary.dark : tokens.colors.text.secondary.light)} />
                        </MotiView>
                    </View>
                )}

                <TextInput
                    className={`flex-1 text-text-primary dark:text-text-primary-dark font-primary text-base ${props.multiline ? 'min-h-[60px] text-top' : 'h-full'}`}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? tokens.colors.text.disabled.dark : tokens.colors.text.disabled.light}
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
                        <Icon name={showPassword ? "eye-off" : "eye"} size={tokens.dimensions.icon.md} color={isFocused ? tokens.colors.primary.light : (isDark ? tokens.colors.text.secondary.dark : tokens.colors.text.secondary.light)} />
                    </TouchableOpacity>
                ) : rightIcon ? (
                    <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress} className="px-2">
                        <Icon name={rightIcon} size={tokens.dimensions.icon.md} color={isFocused ? tokens.colors.primary.light : (isDark ? tokens.colors.text.secondary.dark : tokens.colors.text.secondary.light)} />
                    </TouchableOpacity>
                ) : null}
            </MotiView>
            {error && (
                <MotiView from={{ opacity: 0, translateY: -5 }} animate={{ opacity: 1, translateY: 0 }}>
                    <Text className="text-status-error text-sm mt-1 ml-1 font-primary">{error}</Text>
                </MotiView>
            )}
        </MotiView>
    );
};
