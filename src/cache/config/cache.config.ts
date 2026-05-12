import { registerAs } from '@nestjs/config';

import { IsOptional, IsString } from 'class-validator';
import validateConfig from '@utils/validate-config';
import { RedisConfig } from './cache-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  REDIS_PORT?: string;

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

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  REDIS_TLS_ENABLED?: string;
}

function parseRedisUrl(url: string): {
  host: string;
  port: number;
  username: string;
  password: string;
} {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      username: decodeURIComponent(parsed.username || 'default'),
      password: decodeURIComponent(parsed.password || ''),
    };
  } catch {
    return { host: '', port: 6379, username: 'default', password: '' };
  }
}

export function getConfig(): RedisConfig {
  if (process.env.REDIS_URL) {
    const parsed = parseRedisUrl(process.env.REDIS_URL);
    const tlsEnabled =
      process.env.REDIS_TLS_ENABLED === 'true' ||
      parsed.port === 6380;
    return {
      host: parsed.host,
      port: parsed.port,
      username: parsed.username,
      password: parsed.password,
      tls: tlsEnabled ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.REDIS_HOST ?? '',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    username: process.env.REDIS_USERNAME ?? 'default',
    password: process.env.REDIS_PASSWORD ?? '',
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
