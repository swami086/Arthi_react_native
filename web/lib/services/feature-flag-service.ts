import { createClient } from '../supabase/client';

/**
 * Service for managing and checking feature flags.
 */
export const featureFlagService = {
    /**
     * Check if a feature flag is enabled for a specific user.
     */
    async isFeatureEnabled(flagName: string, userId: string): Promise<boolean> {
        const supabase = createClient();

        const { data, error } = await supabase.rpc('is_feature_enabled', {
            flag_name: flagName,
            check_user_id: userId
        });

        if (error) {
            console.error(`Error checking feature flag ${flagName}:`, error);
            return false;
        }

        return !!data;
    },

    /**
     * Get all active feature flags for a user.
     */
    async getActiveFlags(userId: string): Promise<string[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('feature_flags')
            .select('name, is_enabled, rollout_percentage')
            .eq('is_enabled', true);

        if (error) throw error;

        // Filter based on rollout percentage (simple hash-based rollout)
        return data
            .filter(flag => {
                if (flag.rollout_percentage >= 100) return true;
                const userHash = this.getSimpleHash(`${userId}:${flag.name}`);
                return (userHash % 100) < flag.rollout_percentage;
            })
            .map(f => f.name);
    },

    /**
     * Simple numeric hash for rollout calculation.
     */
    getSimpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
};
