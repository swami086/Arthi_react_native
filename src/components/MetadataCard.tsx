import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MetadataCardProps {
  icon: string;
  label: string;
  value: string | number;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({ icon, label, value }) => {
  return (
    <View className="flex-1 bg-surface p-3 rounded-lg border border-gray-700 items-center mx-1 shadow-sm">
      <MaterialCommunityIcons name={icon as any} size={20} color="#30bae8" className="mb-2" />
      <Text className="text-white font-bold text-sm mb-1 text-center" numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-gray-400 text-xs text-center">
        {label}
      </Text>
    </View>
  );
};
