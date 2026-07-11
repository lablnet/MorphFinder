export type CacheCategory = 'Developer' | 'Application' | 'AI' | 'System';

export interface CacheTarget {
  id: string;
  name: string;
  category: CacheCategory;
  path: string;
  sizeInBytes: number;
  description: string;
}

export interface CacheScanResult {
  isSupported: boolean;
  targets: CacheTarget[];
}

export interface CacheCleanRequest {
  targetIds: string[];
}

export interface CacheCleanResult {
  success: boolean;
  cleanedSizes: Record<string, number>; // maps targetId -> freed size in bytes
  errors: Record<string, string>; // maps targetId -> error message if deletion failed
}
