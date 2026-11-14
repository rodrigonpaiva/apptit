export const storageCategories = ['cold_bof', 'cold_produce', 'cold_raw_meat_fish', 'cold_finished', 'dry'] as const;
export type StorageCategory = typeof storageCategories[number];
export interface StorageLocation { id: string; name: string; category: StorageCategory | null; isActive: boolean; version: number }
export interface SaveStorageLocation { scope: { tenantId: string; siteId: string }; id: string | null; expectedVersion: number; name: string; category: StorageCategory; isActive: boolean }
