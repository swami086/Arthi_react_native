import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ status, lastSaved }) => {
  if (status === 'idle' && !lastSaved) return null;

  let iconName = 'cloud-check';
  let iconColor = '#9ba8ae'; // gray
  let text = '';

  switch (status) {
    case 'saving':
      iconName = 'cloud-upload';
      iconColor = '#30bae8'; // primary
      text = 'Saving...';
      break;
    case 'saved':
      iconName = 'check-circle';
      iconColor = '#10b981'; // green
      text = 'Saved';
      break;
    case 'error':
      iconName = 'alert-circle';
      iconColor = '#ef4444'; // red
      text = 'Failed to save';
      break;
    default:
      if (lastSaved) {
        text = `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
  }

  return (
    <View className="flex-row items-center">
      <MaterialCommunityIcons name={iconName as any} size={14} color={iconColor} />
      <Text className="text-xs text-gray-500 ml-1.5 font-medium">
        {text}
      </Text>
    </View>
  );
};
