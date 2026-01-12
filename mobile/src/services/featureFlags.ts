import { supabase } from '../api/supabase';

class FeatureFlagService {
    private cache: Map<string, { value: boolean; timestamp: number }> = new Map();
    private cacheDuration = 5 * 60 * 1000; // 5 minutes

    async isEnabled(flagName: string, userId: string): Promise<boolean> {
        // Check cache
        const cached = this.cache.get(flagName);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.value;
        }

        try {
            const { data, error } = await supabase.rpc('is_feature_enabled', {
                flag_name: flagName,
                check_user_id: userId,
            });

            if (error) {
                console.error('Feature flag error:', error);
                return false;
            }

            // Cache result
            this.cache.set(flagName, {
                value: data || false,
                timestamp: Date.now(),
            });

            return data || false;
        } catch (error) {
            console.error('Feature flag error:', error);
            return false;
        }
    }

    clearCache() {
        this.cache.clear();
    }
}

export const featureFlagService = new FeatureFlagService();
