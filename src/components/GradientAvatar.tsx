import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientAvatarProps {
    source: { uri: string } | number;
    size?: number;
    online?: boolean;
}

export const GradientAvatar: React.FC<GradientAvatarProps> = ({ source, size = 80, online = false }) => {
    return (
        <View className="relative">
            <LinearGradient
                colors={['#30bae8', '#9055ff']}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    padding: 2, // Border width
                }}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'white',
                        borderRadius: (size - 4) / 2,
                        padding: 2, // Whitespace between gradient and image
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        source={source}
                        style={{
                            width: size - 8,
                            height: size - 8,
                            borderRadius: (size - 8) / 2,
                        }}
                    />
                </View>
            </LinearGradient>
            {online && (
                <View
                    className="absolute bottom-1 right-1 bg-green-500 rounded-full border-2 border-white"
                    style={{
                        width: size * 0.2,
                        height: size * 0.2,
                    }}
                />
            )}
        </View>
    );
};
