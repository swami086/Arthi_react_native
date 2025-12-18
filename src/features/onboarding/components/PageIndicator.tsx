import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

interface PageIndicatorProps {
    totalPages: number;
    currentPage: number;
    activeColor?: string;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({ totalPages, currentPage, activeColor = 'bg-primary dark:bg-primary-dark' }) => {
    return (
        <View className="flex-row justify-center items-center space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => {
                const isActive = index === currentPage;
                return (
                    <MotiView
                        key={index}
                        // Update active indicator to pill shape: h-2.5 w-8 rounded-full
                        // Update inactive indicators to circles: h-2.5 w-2.5 rounded-full
                        animate={{
                            width: isActive ? 32 : 10,
                            opacity: isActive ? 1 : 0.3
                        }}
                        transition={{ type: 'timing', duration: 300 }}
                        // Use opacity variations for inactive states (handled via animate prop or className)
                        className={`h-2.5 rounded-full ${isActive ? `${activeColor}` : 'bg-gray-400 dark:bg-gray-600'}`}
                    />
                );
            })}
        </View>
    );
};
