import { Redis } from '@upstash/redis';

interface MemoryCacheItem<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private store = new Map<string, MemoryCacheItem<unknown>>();

  public get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds: number = 86400): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });

    // Dọn dẹp key hết hạn nếu store quá lớn (>1000 items)
    if (this.store.size > 1000) {
      this.cleanup();
    }
  }

  public delete(key: string): void {
    this.store.delete(key);
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  private cleanup(): void {
    const now = Date.now();
    this.store.forEach((item, key) => {
      if (now > item.expiresAt) {
        this.store.delete(key);
      }
    });
  }
}

export class CacheService {
  private redis: Redis | null = null;
  private memoryCache: InMemoryCache;
  private isRedisConfigured: boolean = false;

  constructor() {
    this.memoryCache = new InMemoryCache();

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (redisUrl && redisToken && !redisUrl.includes('your-upstash-redis')) {
      try {
        this.redis = new Redis({
          url: redisUrl,
          token: redisToken,
        });
        this.isRedisConfigured = true;
      } catch (err) {
        console.warn('Upstash Redis init failed, falling back to memory cache:', err);
        this.isRedisConfigured = false;
      }
    }
  }

  public isUsingRedis(): boolean {
    return this.isRedisConfigured;
  }

  /**
   * Lấy giá trị từ Cache theo key
   */
  public async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConfigured && this.redis) {
      try {
        const val = await this.redis.get<T>(key);
        return val ?? null;
      } catch (err) {
        console.warn(`Redis get failed for key ${key}, falling back to memory:`, err);
      }
    }

    return this.memoryCache.get<T>(key);
  }

  /**
   * Lưu giá trị vào Cache với TTL tính theo giây (mặc định 24h = 86400s)
   */
  public async set<T>(key: string, value: T, ttlSeconds: number = 86400): Promise<void> {
    // Luôn lưu vào memory cache để dự phòng
    this.memoryCache.set(key, value, ttlSeconds);

    if (this.isRedisConfigured && this.redis) {
      try {
        await this.redis.set(key, value, { ex: ttlSeconds });
      } catch (err) {
        console.warn(`Redis set failed for key ${key}:`, err);
      }
    }
  }

  /**
   * Xóa một key khỏi cache
   */
  public async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.isRedisConfigured && this.redis) {
      try {
        await this.redis.del(key);
      } catch (err) {
        console.warn(`Redis del failed for key ${key}:`, err);
      }
    }
  }
}

// Singleton Cache Instance
export const cacheService = new CacheService();
