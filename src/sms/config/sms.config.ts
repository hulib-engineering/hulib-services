import { registerAs } from '@nestjs/config';
import { IsString } from 'class-validator';

import { SmsConfig } from './sms-config.type';

import validateConfig from '../../utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  SMS_API_KEY: string;

  @IsString()
  SMS_API_SECRET: string;

  @IsString()
  SMS_DEFAULT_PHONE_NUMBER: string;
}

export default registerAs<SmsConfig>('sms', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    apiKey: process.env.SMS_API_KEY,
    apiSecret: process.env.SMS_API_SECRET,
    defaultPhoneNumber: process.env.SMS_DEFAULT_PHONE_NUMBER,
  };
});
