
import { A2UISurface } from './types';

// ============================================================================
// Cache Implementation
// ============================================================================

/**
 * A2UICache provides persistent storage for A2UI surfaces using IndexedDB.
 * This allows for faster initial loads and offline support.
 */
class A2UICache {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'a2ui-cache';
    private readonly STORE_NAME = 'surfaces';
    private readonly VERSION = 1;

    /**
     * Initializes the IndexedDB database and creates object stores and indexes.
     * 
     * @returns A promise that resolves to the opened IDBDatabase instance
     */
    async init(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.VERSION);

            request.onerror = () => {
                console.error('Failed to open A2UI cache DB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'surfaceId' });
                    store.createIndex('userId', 'userId', { unique: false });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                }
            };
        });
    }

    /**
     * Saves a surface to the local cache.
     * 
     * @param surface - The A2UISurface object to store
     */
    async saveSurface(surface: A2UISurface): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.put(surface);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieves a single surface from the cache by ID.
     * 
     * @param surfaceId - The unique ID of the surface
     * @returns The surface object or undefined if not found
     */
    async getSurface(surfaceId: string): Promise<A2UISurface | undefined> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.get(surfaceId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Retrieves all cached surfaces belonging to a specific user.
     * 
     * @param userId - The user ID to filter by
     * @returns An array of cached surfaces
     */
    async getAllSurfaces(userId: string): Promise<A2UISurface[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const index = store.index('userId');

            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Removes a surface from the local cache.
     * 
     * @param surfaceId - The ID of the surface to delete
     */
    async deleteSurface(surfaceId: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);

            const request = store.delete(surfaceId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clears surfaces from the cache that are older than the specified age.
     * 
     * @param maxAgeMs - The maximum age in milliseconds (defaults to 7 days)
     */
    async clearOldSurfaces(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('Database not initialized'));

            const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const index = store.index('updatedAt');

            // Find keys older than cutoff
            const cutoff = new Date(Date.now() - maxAgeMs).toISOString();
            const request = index.getAllKeys(IDBKeyRange.upperBound(cutoff));

            request.onsuccess = () => {
                const keys = request.result;
                if (keys.length === 0) {
                    resolve();
                    return;
                }

                // Delete individually (could be optimized with cursor for huge datasets)
                let deletedCount = 0;
                keys.forEach(key => {
                    const delReq = store.delete(key);
                    delReq.onsuccess = () => {
                        deletedCount++;
                        if (deletedCount === keys.length) resolve();
                    };
                });
            };
            request.onerror = () => reject(request.error);
        });
    }
}

export const a2uiCache = new A2UICache();
