/**
 * Simple client-side cache service using localStorage.
 */
export const cacheService = {
    /**
     * Get item from cache.
     */
    get<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;

        const item = localStorage.getItem(`cache:${key}`);
        if (!item) return null;

        try {
            const parsed = JSON.parse(item);
            if (parsed.expiry && new Date().getTime() > parsed.expiry) {
                localStorage.removeItem(`cache:${key}`);
                return null;
            }
            return parsed.value;
        } catch (e) {
            return null;
        }
    },

    /**
     * Set item in cache with TTL (in minutes).
     */
    set<T>(key: string, value: T, ttlMinutes = 5): void {
        if (typeof window === 'undefined') return;

        const expiry = new Date().getTime() + (ttlMinutes * 60 * 1000);
        localStorage.setItem(`cache:${key}`, JSON.stringify({
            value,
            expiry
        }));
    },

    /**
     * Remove item from cache.
     */
    remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(`cache:${key}`);
    },

    /**
     * Clear all cache entries.
     */
    clear(): void {
        if (typeof window === 'undefined') return;
        Object.keys(localStorage)
            .filter(key => key.startsWith('cache:'))
            .forEach(key => localStorage.removeItem(key));
    }
};
