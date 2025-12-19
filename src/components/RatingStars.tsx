import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    maxRating = 5,
    onRatingChange,
    size = 24,
    readonly = false,
}) => {
    return (
        <View className="flex-row">
            {Array.from({ length: maxRating }).map((_, index) => {
                const filled = index < Math.floor(rating);
                const halfFilled = !filled && index < rating; // Simple logic, can be improved for precise half stars

                return (
                    <TouchableOpacity
                        key={index}
                        disabled={readonly}
                        onPress={() => onRatingChange && onRatingChange(index + 1)}
                        activeOpacity={0.7}
                    >
                        <MotiView
                            animate={{ scale: filled ? 1 : 0.9 }}
                            transition={{ type: 'spring' }}
                            style={{ marginRight: 4 }}
                        >
                            <MaterialCommunityIcons
                                name={filled ? "star" : halfFilled ? "star-half-full" : "star-outline"}
                                size={size}
                                color="#fbbf24" // amber-400
                            />
                        </MotiView>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
