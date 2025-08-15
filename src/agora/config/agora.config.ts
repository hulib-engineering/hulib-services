import { registerAs } from '@nestjs/config';
import { IsString, IsOptional } from 'class-validator';

import validateConfig from '@utils/validate-config';

import { AgoraConfig } from './agora-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  AGORA_APP_ID: string;

  @IsString()
  @IsOptional()
  AGORA_APP_CERTIFICATE: string;

  @IsString()
  @IsOptional()
  AGORA_CUSTOMER_ID: string;

  @IsString()
  @IsOptional()
  AGORA_CUSTOMER_SECRET: string;
}

export default registerAs<AgoraConfig>('agora', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    appId: process.env.AGORA_APP_ID,
    appCertificate: process.env.AGORA_APP_CERTIFICATE,
    customerId: process.env.AGORA_CUSTOMER_ID,
    customerSecret: process.env.AGORA_CUSTOMER_SECRET,
  };
});
