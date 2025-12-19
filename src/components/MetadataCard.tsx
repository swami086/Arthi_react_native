import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

interface MetadataCardProps {
  icon: any;
  label: string;
  value: string | number;
}

const MetadataCard: React.FC<MetadataCardProps> = ({ icon, label, value }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl items-center mx-1 shadow-sm">
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color="#0ea5e9"
        style={{ marginBottom: 4 }}
      />
      <Text className="text-lg font-bold text-slate-800 dark:text-white mb-1">
        {value}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
        {label}
      </Text>
    </View>
  );
};

export default MetadataCard;
