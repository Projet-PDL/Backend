import Redis from 'ioredis';
import logger from '../utils/logger/logger';

class RedisService {
  private client: Redis | null = null;
  private isAvailable: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redisEnabled = process.env.REDIS_ENABLED || 'false';

      if (!redisEnabled) {
        logger.info('Redis is disabled via REDIS_ENABLED environment variable');
        return;
      }

      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis connection failed after 3 retries, falling back to non-cached mode');
            this.isAvailable = false;
            return null; // Stop retrying
          }
          return Math.min(times * 100, 2000); // Exponential backoff
        },
        lazyConnect: true, // Don't connect immediately
      });

      // Handle connection events
      this.client.on('connect', () => {
        logger.info('Redis client connected successfully');
        this.isAvailable = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready to accept commands');
        this.isAvailable = true;
      });

      this.client.on('error', (error) => {
        logger.warn({ error: error.message }, 'Redis connection error - falling back to non-cached mode');
        this.isAvailable = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis connection closed - falling back to non-cached mode');
        this.isAvailable = false;
      });

      // Try to connect
      this.client.connect().catch((error) => {
        logger.warn({ error: error.message }, 'Failed to connect to Redis - continuing without cache');
        this.isAvailable = false;
      });

    } catch (error) {
      logger.warn({ error }, 'Redis initialization failed - continuing without cache');
      this.client = null;
      this.isAvailable = false;
    }
  }

  /**
   * Get value from Redis cache
   * Returns null if Redis is unavailable or key doesn't exist
   */
  async get(key: string): Promise<string | null> {
    try {
      if (!this.client || !this.isAvailable) {
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      logger.warn({ error, key }, 'Redis GET failed - falling back');
      return null;
    }
  }

  /**
   * Set value in Redis cache with optional TTL (in seconds)
   * Silently fails if Redis is unavailable
   */
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.client || !this.isAvailable) {
        return false;
      }

      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.warn({ error, key }, 'Redis SET failed - continuing without cache');
      return false;
    }
  }

  /**
   * Delete key from Redis cache
   * Silently fails if Redis is unavailable
   */
  async del(key: string): Promise<boolean> {
    try {
      if (!this.client || !this.isAvailable) {
        return false;
      }
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.warn({ error, key }, 'Redis DEL failed - continuing without cache');
      return false;
    }
  }

  /**
   * Check if Redis is available
   */
  isRedisAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error({ error }, 'Error closing Redis connection');
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
