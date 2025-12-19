import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface SoapSectionProps {
  title: string;
  icon: any;
  value: string;
  onChange: (text: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  readOnly?: boolean;
  minChars?: number;
}

const SoapSection: React.FC<SoapSectionProps> = ({
  title,
  icon,
  value,
  onChange,
  isExpanded,
  onToggle,
  readOnly = false,
  minChars = 50,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const charCount = value.length;
  const isValid = charCount >= minChars;

  return (
    <View className="mb-4 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50"
      >
        <View className="flex-row items-center">
          <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
             isValid ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
             <MaterialCommunityIcons
              name={icon}
              size={18}
              color={isValid ? '#0ea5e9' : '#f59e0b'}
            />
          </View>
          <Text className="text-lg font-bold text-slate-800 dark:text-white">
            {title}
          </Text>
        </View>
        <View className="flex-row items-center">
           <Text className={`text-xs mr-2 ${isValid ? 'text-gray-500' : 'text-amber-500 font-medium'}`}>
             {charCount}/{minChars}
           </Text>
           <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={isDark ? '#94a3b8' : '#64748b'}
            />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="p-4 border-t border-gray-100 dark:border-gray-700">
          <TextInput
            className={`text-base leading-6 text-slate-700 dark:text-slate-200 min-h-[120px] ${
              readOnly ? 'opacity-80' : ''
            }`}
            multiline
            value={value}
            onChangeText={onChange}
            editable={!readOnly}
            placeholder={`Enter ${title} notes here...`}
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            textAlignVertical="top"
          />
          {!readOnly && !isValid && (
             <Text className="text-xs text-amber-500 mt-2">
               * Minimum {minChars} characters required
             </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default SoapSection;
