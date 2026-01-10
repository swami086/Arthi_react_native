import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../../hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '../../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotiView } from 'moti';

interface Resource {
    id: string;
    title: string;
    description: string;
    category: 'Guide' | 'Article' | 'Helpline' | 'Tool';
    url?: string;
    icon: string;
    color: string;
}

const RESOURCES: Resource[] = [
    {
        id: '1',
        title: 'Crisis Helplines Manual',
        description: 'Comprehensive guide to handling emergency situations and crisis intervention.',
        category: 'Helpline',
        url: 'https://screens.safespace.com/crisis-manual',
        icon: 'phone-alert',
        color: '#ef4444',
    },
    {
        id: '2',
        title: 'CBT Techniques Guide',
        description: 'Standard Cognitive Behavioral Therapy techniques and worksheets.',
        category: 'Guide',
        url: 'https://screens.safespace.com/cbt-guide',
        icon: 'head-cog-outline',
        color: '#3b82f6',
    },
    {
        id: '3',
        title: 'Therapistship Best Practices',
        description: 'Key principles for effective therapistship and building trust.',
        category: 'Article',
        url: 'https://screens.safespace.com/therapistship-best-practices',
        icon: 'account-group',
        color: '#10b981',
    },
    {
        id: '4',
        title: 'Self-Care for Therapists',
        description: 'Strategies to prevent burnout and maintain your own well-being.',
        category: 'Article',
        url: 'https://screens.safespace.com/self-care',
        icon: 'heart-pulse',
        color: '#f59e0b',
    },
    {
        id: '5',
        title: 'Daily Mindfulness Tools',
        description: 'Collection of mindfulness exercises to recommend to patients.',
        category: 'Tool',
        url: 'https://screens.safespace.com/mindfulness',
        icon: 'meditation',
        color: '#8b5cf6',
    },
];

export const ResourcesScreen = () => {
    const { isDark } = useColorScheme();
    const navigation = useNavigation<RootNavigationProp>();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = ['All', 'Guide', 'Article', 'Helpline', 'Tool'];

    const filteredResources = selectedCategory && selectedCategory !== 'All'
        ? RESOURCES.filter(r => r.category === selectedCategory)
        : RESOURCES;

    const handleOpenLink = async (url?: string) => {
        if (url) {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Icon name="arrow-left" size={24} color={isDark ? '#fff' : '#0f172a'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
                    Resources Library
                </Text>
                <View className="w-10" />
            </View>

            <View className="px-4 py-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row gap-2"
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full mr-2 ${(selectedCategory === cat || (cat === 'All' && !selectedCategory))
                                ? 'bg-primary'
                                : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                        >
                            <Text className={`font-medium ${(selectedCategory === cat || (cat === 'All' && !selectedCategory))
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {filteredResources.map((resource, index) => (
                    <MotiView
                        key={resource.id}
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: index * 100 }}
                    >
                        <TouchableOpacity
                            onPress={() => handleOpenLink(resource.url)}
                            className="bg-white dark:bg-surface-dark rounded-xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-800 flex-row items-start"
                        >
                            <View
                                className="w-12 h-12 rounded-lg items-center justify-center mr-4"
                                style={{ backgroundColor: `${resource.color}20` }}
                            >
                                <Icon name={resource.icon} size={24} color={resource.color} />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row justify-between items-start mb-1">
                                    <Text className="text-base font-bold text-text-main-light dark:text-text-main-dark flex-1 mr-2">
                                        {resource.title}
                                    </Text>
                                    <View className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
                                        <Text className="text-xs text-text-sub-light dark:text-text-sub-dark font-medium">
                                            {resource.category}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-sm text-text-sub-light dark:text-text-sub-dark leading-5">
                                    {resource.description}
                                </Text>
                                <View className="mt-3 flex-row items-center">
                                    <Text className="text-primary text-xs font-bold mr-1">READ MORE</Text>
                                    <Icon name="arrow-right" size={14} color="#30bae8" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </MotiView>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};
