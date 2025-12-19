import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear
}) => {
  return (
    <View className="flex-row items-center bg-surface rounded-lg border border-gray-700 px-3 py-2">
      <MaterialCommunityIcons name="magnify" size={20} color="#9ba8ae" className="mr-2" />
      <TextInput
        className="flex-1 text-white text-base py-1"
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        value={value}
        onChangeText={onChangeText}
        selectionColor="#30bae8"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onChangeText(''))}>
          <MaterialCommunityIcons name="close-circle" size={18} color="#9ba8ae" />
        </TouchableOpacity>
      )}
    </View>
  );
};
