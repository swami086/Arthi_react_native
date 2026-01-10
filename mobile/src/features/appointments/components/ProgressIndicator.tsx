import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';

interface ProgressIndicatorProps {
    currentStep: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ currentStep }) => {
    const totalSteps = 3;

    return (
        <View className="mb-8 items-center">
            {/* Add "Step X of 3" text label above indicators */}
            <Text className="text-xs font-bold text-text-sub-light dark:text-text-sub-dark uppercase tracking-widest mb-3">
                Step {currentStep} of {totalSteps}
            </Text>

            {/* Center align all elements with proper spacing */}
            <View className="flex-row items-center space-x-2">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const step = index + 1;
                    const isActive = step === currentStep;
                    const isCompleted = step < currentStep;

                    return (
                        <MotiView
                            key={index}
                            animate={{
                                // Update indicator styling: active step uses wider pill shape (w-8 h-2.5)
                                // Inactive steps use small circles (w-2.5 h-2.5)
                                width: isActive ? 32 : 10,
                                backgroundColor: isActive
                                    ? '#30bae8' // primary
                                    : isCompleted
                                        ? '#30bae8'
                                        : '#d1d5db', // gray-300 or primary with opacity
                                opacity: isActive || isCompleted ? 1 : 0.3
                            }}
                            transition={{ type: 'timing', duration: 300 }}
                            className="h-2.5 rounded-full"
                        />
                    );
                })}
            </View>
        </View>
    );
};
