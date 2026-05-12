import { registerAs } from '@nestjs/config';

import { IsOptional, IsString } from 'class-validator';
import validateConfig from '@utils/validate-config';
import { RedisConfig } from './cache-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsString()
  REDIS_PORT: string;

  @IsString()
  @IsOptional()
  REDIS_USERNAME?: string;

  @IsOptional()
  @IsString()
  REDIS_TLS?: string;

  @IsOptional()
  @IsString()
  REDIS_REJECT_UNAUTHORIZED?: string;

  @IsOptional()
  @IsString()
  REDIS_CA?: string;

  @IsOptional()
  @IsString()
  REDIS_KEY?: string;

  @IsOptional()
  @IsString()
  REDIS_CERT?: string;
}

export function getConfig(): RedisConfig {
  return {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    username: process.env.REDIS_USERNAME ?? 'default',
    password: process.env.REDIS_PASSWORD,
    tls:
      process.env.REDIS_TLS === 'true'
        ? {
            rejectUnauthorized:
              process.env.REDIS_REJECT_UNAUTHORIZED === 'true',
            ca: process.env.REDIS_CA ?? undefined,
            key: process.env.REDIS_KEY ?? undefined,
            cert: process.env.REDIS_CERT ?? undefined,
          }
        : undefined,
  };
}

export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return getConfig();
});
