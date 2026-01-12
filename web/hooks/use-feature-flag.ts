'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export function useFeatureFlag(flagName: string): boolean {
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkFlag() {
            const supabase = createBrowserClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsEnabled(false);
                setLoading(false);
                return;
            }

            // Check feature flag
            const { data, error } = await supabase.rpc('is_feature_enabled', {
                flag_name: flagName,
                check_user_id: user.id,
            });

            if (!error) {
                setIsEnabled(data || false);
            }

            setLoading(false);
        }

        checkFlag();
    }, [flagName]);

    return isEnabled;
}

// Usage example:
// const isAIChatEnabled = useFeatureFlag('ai_chat_enabled');
