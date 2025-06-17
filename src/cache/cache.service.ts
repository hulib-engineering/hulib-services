import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache as CacheManager } from 'cache-manager';
import util from 'util';

import { AllConfigType } from '@config/config.type';
import { CacheKey, CacheParam } from '@utils/types/cache.type';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.logger.log(cacheManager);
  }

  async get<T>(keyParams: CacheParam) {
    return this.cacheManager.get<T>(this._constructCacheKey(keyParams));
  }

  /**
   * Return the remaining ttl of a key if it was set.
   * By default -1 and -2, cases are obfuscated to avoid confusion but if `disableResponseFilter = true`:
   * -1: If key exists but has no expiry
   * -2: If key does not exist at all
   */
  // async getTtl(
  //   keyParams: CacheParam,
  //   options?: { disableResponseFilter?: false },
  // ): Promise<number | null> {
  //   const ttl = await this.cacheManager.store.ttl(
  //     this._constructCacheKey(keyParams),
  //   );
  //
  //   if (!options?.disableResponseFilter && [-1, -2].includes(ttl)) {
  //     return null;
  //   }
  //   return ttl ?? null;
  // }

  async set(
    keyParams: CacheParam,
    value: unknown,
    options?: {
      /**
       * In milliseconds
       */
      ttl?: number;
    },
  ): Promise<{ key: string }> {
    const key = this._constructCacheKey(keyParams);
    await this.cacheManager.set(key, value, options?.ttl);
    return { key };
  }

  // storeGet<T>(keyParams: CacheParam) {
  //   return this.cacheManager.store.get<T>(this._constructCacheKey(keyParams));
  // }

  // async storeSet<T>(
  //   keyParams: CacheParam,
  //   value: T,
  //   options?: {
  //     /**
  //      * In milliseconds
  //      */
  //     ttl?: number;
  //   },
  // ): Promise<{ key: string }> {
  //   const key = this._constructCacheKey(keyParams);
  //   await this.cacheManager.store.set<T>(
  //     this._constructCacheKey(keyParams),
  //     value,
  //     options?.ttl,
  //   );
  //   return { key };
  // }

  // async delete(keyParams: CacheParam): Promise<{ key: string }> {
  //   const key = this._constructCacheKey(keyParams);
  //   await this.cacheManager.store.del(key);
  //   return { key };
  // }

  private _constructCacheKey(keyParams: CacheParam): string {
    const prefix = this.configService.get('app.apiPrefix', { infer: true });
    return util.format(
      `${prefix}:${CacheKey[keyParams.key]}`,
      ...(keyParams.args ?? []),
    );
  }
}
