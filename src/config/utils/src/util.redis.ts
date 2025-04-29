/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { APP_NAME, NODE_ENV, REDIS_URL } from './util.constants';

@Injectable()
export class CacheHelper {
  private readonly logger = new Logger(CacheHelper.name);
  private redis: Redis | null = null;
  private maxRetries = 3;
  private retryDelay = 2000; // 2 seconds

  constructor() {}

  cacheExpiry = {
    oneMinute: 60,
    fiveMinutes: 60 * 5,
    fifteenMinutes: 60 * 15,
    thirtyMinutes: 60 * 30,
    oneHour: 60 * 60,
    twoHours: 60 * 60 * 2,
    threeHours: 60 * 60 * 3,
    fiveHours: 60 * 60 * 5,
    aDay: 60 * 60 * 24,
    aWeek: 60 * 60 * 24 * 7,
    aMonth: 60 * 60 * 24 * 30,
    aYear: 60 * 60 * 24 * 365,
  };

  cacheKeyPrefix = `${APP_NAME}:${NODE_ENV}:`;
  addCacheKey = (key: string) => `${this.cacheKeyPrefix}${key}`;

  cacheKeys = {
    fileUpload: (fileName: string) => {
      return this.addCacheKey(`fileUpload:${fileName}`);
    },
    walletNonce: (walletAddress: string) => {
      return this.addCacheKey(`walletNonce:${walletAddress}`);
    },
    walletNonceRateLimit: (walletAddress: string) => {
      return this.addCacheKey(`walletNonceRateLimit:${walletAddress}`);
    },
  };

  async initializeRedis(retryCount = 0) {
    try {
      this.redis = new Redis(REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      // Listen to redis connection events
      this.redis.on('connect', () =>
        this.logger.log('Redis connected successfully'),
      );

      this.redis.on('error', (err: Error) => {
        (async () => {
          this.logger.error('Redis connection error: ', err);

          if (retryCount < this.maxRetries) {
            this.logger.log(
              `Attempting to reconnect to Redis (attempt ${retryCount + 1}/${this.maxRetries})...`,
            );

            // Clean up existing connection
            if (this.redis) {
              this.redis.disconnect();
              this.redis = null;
            }

            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, this.retryDelay),
            );

            // Retry connection
            await this.initializeRedis(retryCount + 1);
          } else {
            this.logger.error(
              `Failed to connect to Redis after ${this.maxRetries} attempts`,
            );
          }
        })().catch((err) => {
          this.logger.error('Redis connection error: ', err);
        });
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);

      if (retryCount < this.maxRetries) {
        this.logger.log(
          `Attempting to reconnect to Redis (attempt ${retryCount + 1}/${this.maxRetries})...`,
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));

        // Retry connection
        await this.initializeRedis(retryCount + 1);
      } else {
        this.logger.error(
          `Failed to connect to Redis after ${this.maxRetries} attempts`,
        );
      }
    }
  }

  async setCache(
    key: string,
    value: unknown,
    expiry?: number,
  ): Promise<boolean> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      const json = JSON.stringify(value);

      if (expiry) {
        await this.redis.set(key, json, 'EX', expiry);
      } else {
        await this.redis.set(key, json);
      }

      return true;
    } catch (error) {
      this.logger.error(`Error in setCache for key '${key}':`, error);
      return false;
    }
  }

  async getCache<T = unknown>(key: string): Promise<T | null> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      const json = await this.redis.get(key);

      if (json) {
        return JSON.parse(json) as T;
      }

      return null;
    } catch (error) {
      this.logger.error(`Error getting cache for key '${key}':`, error);
      return null;
    }
  }

  async removeFromCache(key: string): Promise<boolean> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error removing from cache for key '${key}':`, error);
      return false;
    }
  }

  async invalidateCacheForResource(resourcePath: string): Promise<number> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      const pattern = `${resourcePath}*`;
      const keys = await this.scanKeys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      await Promise.all(keys.map((key) => this.removeFromCache(key)));
      return keys.length;
    } catch (error) {
      this.logger.error(
        `Error invalidating cache for resource '${resourcePath}':`,
        error,
      );
      return 0;
    }
  }

  async scanKeys(pattern: string): Promise<string[]> {
    try {
      if (!this.redis) {
        throw new Error('Redis is not initialized');
      }

      let cursor = '0';
      let keys: string[] = [];

      do {
        const response = await this.redis.scan(cursor, 'MATCH', pattern);
        cursor = response[0];

        const matchedKeys = response[1].filter((key) => {
          const [basePath] = key.split('?');
          return basePath.startsWith(pattern.replace('*', ''));
        });

        keys = keys.concat(matchedKeys);
      } while (cursor !== '0');

      return keys;
    } catch (error) {
      this.logger.error(`Error scanning keys for pattern '${pattern}':`, error);
      return [];
    }
  }

  async getTtl(key: string): Promise<number> {
    if (!this.redis) {
      throw new Error('Redis is not initialized');
    }

    try {
      const ttl = await this.redis.ttl(key);
      return ttl;
    } catch (err) {
      this.logger.error(`Error getting TTL for key '${key}':`, err);
      return -1;
    }
  }

  // Add a method to check Redis connection status
  isConnected(): boolean {
    return this.redis !== null && this.redis.status === 'ready';
  }

  // Add a method to properly close Redis connection
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  // Method to manually force a reconnection
  async reconnect(): Promise<void> {
    this.logger.log('Manually reconnecting to Redis...');
    await this.close();
    await this.initializeRedis();
  }
}
export const CacheHelperUtil = new CacheHelper();
