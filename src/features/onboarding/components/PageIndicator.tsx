import React from 'react';
import { View } from 'react-native';

interface PageIndicatorProps {
    totalPages: number;
    currentPage: number;
    activeColor?: string;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({ totalPages, currentPage, activeColor = 'bg-primary dark:bg-primary-dark' }) => {
    return (
        <View className="flex-row justify-center space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => {
                const isActive = index === currentPage;
                return (
                    <View
                        key={index}
                        className={`h-2 rounded-full ${isActive ? `w-6 ${activeColor}` : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                    />
                );
            })}
        </View>
    );
};
