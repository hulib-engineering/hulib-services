import { readFileSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const tlsEnabled =
          config.get<string>('REDIS_TLS') === 'true';

        // Accept either inline PEM contents or a certificate file path.
        const getCertificate = (name: string) => {
          const value = config.get<string>(name)?.trim();

          if (!value) return undefined;

          return value.includes('-----BEGIN')
            ? value
            : readFileSync(value);
        };

        const password = config.get<string>('REDIS_PASSWORD');

        const client = createClient({
          socket: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: Number(config.get<string>('REDIS_PORT', '6379')),

            ...(tlsEnabled
              ? {
                  tls: true,
                  rejectUnauthorized:
                    config.get<string>(
                      'REDIS_REJECT_UNAUTHORIZED',
                    ) !== 'false',
                  ca: getCertificate('REDIS_CA'),
                  key: getCertificate('REDIS_KEY'),
                  cert: getCertificate('REDIS_CERT'),
                }
              : {}),
          },

          ...(password ? { password } : {}),
        });

        client.on('error', (err) => {
          console.error('Redis Client Error', err);
        });

        await client.connect();

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}