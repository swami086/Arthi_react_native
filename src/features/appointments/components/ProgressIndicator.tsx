import React from 'react';
import { View, Text } from 'react-native';

interface ProgressIndicatorProps {
    currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
    const totalSteps = 3;

    return (
        <View className="mb-8">
            <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    Step {currentStep} of {totalSteps}
                </Text>
            </View>
            <View className="flex-row space-x-2">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const step = index + 1;
                    const isActive = step <= currentStep;
                    return (
                        <View
                            key={index}
                            className={`h-1.5 flex-1 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-200'
                                }`}
                        />
                    );
                })}
            </View>
        </View>
    );
};
