import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

import { AllConfigType } from '@config/config.type';

async function useCacheFactory(config: ConfigService<AllConfigType>) {
  console.log('Config', config);

  return {
    store: await redisStore({
      host: config.getOrThrow('redis.host', {
        infer: true,
      }),
      port: config.getOrThrow('redis.port', {
        infer: true,
      }),
      username: 'default',
      password: config.getOrThrow('redis.password', {
        infer: true,
      }),
      tls: config.get('redis.tls', { infer: true }),
    }),
  };
}

export default useCacheFactory;
