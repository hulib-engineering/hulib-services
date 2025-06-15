import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

import { AllConfigType } from '@config/config.type';

async function useCacheFactory(config: ConfigService<AllConfigType>) {
  return {
    store: await redisStore({
      host: config.getOrThrow('redis.host', {
        infer: true,
      }),
      port: config.getOrThrow('redis.port', {
        infer: true,
      }),
      username: config.getOrThrow('redis.username', {
        infer: true,
      }),
      password: config.getOrThrow('redis.password', {
        infer: true,
      }),
      tls: config.get('redis.tls', { infer: true }),
    }),
  };
}

export default useCacheFactory;
