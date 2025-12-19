import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ConsentCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({ checked, onToggle, label }) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      className="flex-row items-start py-2"
      activeOpacity={0.8}
    >
      <View className={`w-6 h-6 rounded border mr-3 items-center justify-center mt-0.5 ${checked ? 'bg-primary border-primary' : 'bg-transparent border-gray-500'}`}>
        {checked && <MaterialCommunityIcons name="check" size={16} color="white" />}
      </View>
      <Text className="flex-1 text-gray-300 text-sm leading-5">
        {label}
      </Text>
    </TouchableOpacity>
  );
};
