import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      className="flex-row items-start py-2"
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        className={`w-6 h-6 rounded border mr-3 items-center justify-center ${
          checked
            ? 'bg-primary-500 border-primary-500'
            : 'bg-transparent border-gray-400 dark:border-gray-500'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {checked && (
          <MaterialCommunityIcons name="check" size={16} color="white" />
        )}
      </View>
      <Text className={`flex-1 text-sm leading-5 ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      } ${disabled ? 'opacity-50' : ''}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default ConsentCheckbox;
