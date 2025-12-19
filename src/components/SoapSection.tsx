import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CharacterCounter } from './CharacterCounter';

interface SoapSectionProps {
  id: string;
  title: string;
  icon: string;
  value: string;
  onChangeText: (text: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  isReadOnly?: boolean;
  minChars?: number;
  maxChars?: number;
  placeholder?: string;
}

export const SoapSection: React.FC<SoapSectionProps> = ({
  id,
  title,
  icon,
  value,
  onChangeText,
  isExpanded,
  onToggle,
  isReadOnly = false,
  minChars = 50,
  maxChars = 2000,
  placeholder
}) => {
  return (
    <View className="mb-4 bg-surface rounded-xl border border-gray-700 overflow-hidden">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4 bg-surface/50"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
            <Text className="text-primary font-bold text-sm">{id}</Text>
          </View>
          <View>
            <Text className="text-white font-bold text-base">{title}</Text>
            {!isExpanded && (
              <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                {value.length > 0 ? `${value.substring(0, 40)}...` : 'Empty'}
              </Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color="#9ba8ae"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View className="p-4 border-t border-gray-700 bg-background/50">
          <TextInput
            className={`text-white text-base leading-6 min-h-[120px] mb-2 ${isReadOnly ? 'text-gray-300' : ''}`}
            multiline
            textAlignVertical="top"
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#4b5563"
            editable={!isReadOnly}
            scrollEnabled={false}
          />
          <CharacterCounter current={value.length} min={minChars} max={maxChars} />
        </View>
      )}
    </View>
  );
};
