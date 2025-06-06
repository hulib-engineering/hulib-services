type RedisTlsConfig = {
  rejectUnauthorized?: boolean;
  ca?: string;
  key?: string;
  cert?: string;
};

export type RedisConfig = {
  host?: string;
  password?: string;
  port?: number;
  tls?: RedisTlsConfig;
};
