import { createClient } from '../supabase/client';

export interface UserAgentPreferences {
    userId: string;
    enabledAgents: string[];
    notificationFrequency: 'minimal' | 'reduced' | 'normal' | 'proactive';
    quietHoursStart?: string;
    quietHoursEnd?: string;
    dataSharingConsent: boolean;
    transparencyLevel: 'simple' | 'detailed' | 'technical';
    languagePreference: 'en' | 'hi' | 'hinglish';
}

/**
 * Service for managing user-specific AI agent preferences.
 */
export const preferencesService = {
    /**
     * Get user preferences from the database.
     */
    async getUserPreferences(userId: string): Promise<UserAgentPreferences | null> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('user_agent_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching preferences:', error);
            throw error;
        }

        if (!data) return null;

        return {
            userId: data.user_id,
            enabledAgents: data.enabled_agents || [],
            notificationFrequency: data.notification_frequency || 'normal',
            quietHoursStart: data.quiet_hours_start,
            quietHoursEnd: data.quiet_hours_end,
            dataSharingConsent: data.data_sharing_consent ?? true,
            transparencyLevel: data.transparency_level || 'simple',
            languagePreference: data.language_preference || 'en'
        };
    },

    /**
     * Update user preferences.
     */
    async updatePreferences(userId: string, prefs: Partial<UserAgentPreferences>) {
        const supabase = createClient();

        const updateData: any = {
            user_id: userId,
            updated_at: new Date().toISOString()
        };

        if (prefs.enabledAgents) updateData.enabled_agents = prefs.enabledAgents;
        if (prefs.notificationFrequency) updateData.notification_frequency = prefs.notificationFrequency;
        if (prefs.quietHoursStart) updateData.quiet_hours_start = prefs.quietHoursStart;
        if (prefs.quietHoursEnd) updateData.quiet_hours_end = prefs.quietHoursEnd;
        if (prefs.dataSharingConsent !== undefined) updateData.data_sharing_consent = prefs.dataSharingConsent;
        if (prefs.transparencyLevel) updateData.transparency_level = prefs.transparencyLevel;
        if (prefs.languagePreference) updateData.language_preference = prefs.languagePreference;

        const { data, error } = await supabase
            .from('user_agent_preferences')
            .upsert(updateData)
            .select()
            .single();

        if (error) {
            console.error('Error updating preferences:', error);
            throw error;
        }

        return data;
    },

    /**
     * Check if current time is within user's quiet hours.
     */
    checkQuietHours(prefs: UserAgentPreferences): boolean {
        if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false;

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (prefs.quietHoursStart <= prefs.quietHoursEnd) {
            return currentTime >= prefs.quietHoursStart && currentTime <= prefs.quietHoursEnd;
        } else {
            // Overlap midnight
            return currentTime >= prefs.quietHoursStart || currentTime <= prefs.quietHoursEnd;
        }
    }
};
