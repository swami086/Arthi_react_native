import React from 'react';
import { View, Text } from 'react-native';

interface CharacterCounterProps {
  current: number;
  min?: number;
  max?: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, min = 0, max }) => {
  const isBelowMin = current < min;
  const isOverMax = max ? current > max : false;

  let colorClass = "text-gray-500";
  if (isBelowMin) colorClass = "text-amber-500";
  if (isOverMax) colorClass = "text-red-500";

  return (
    <View className="flex-row justify-end mt-1">
      <Text className={`text-xs ${colorClass}`}>
        {current}
        {max ? ` / ${max}` : ''} characters
        {isBelowMin && ` (min ${min})`}
      </Text>
    </View>
  );
};
