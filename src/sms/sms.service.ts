import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Auth } from '@vonage/auth';
import { Vonage } from '@vonage/server-sdk';
import { I18nContext } from 'nestjs-i18n';

import { AllConfigType } from '../config/config.type';
import { MaybeType } from '../utils/types/maybe.type';

@Injectable()
export class SmsService {
  private vonage: Vonage;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const vonageAuth = new Auth({
      apiKey: this.configService.getOrThrow('sms.apiKey', { infer: true }),
      apiSecret: this.configService.getOrThrow('sms.apiSecret', {
        infer: true,
      }),
    });
    this.vonage = new Vonage(vonageAuth);
  }

  async sendSms({ to, code }: { to: string; code: number }): Promise<void> {
    const i18n = I18nContext.current();

    let smsPt1: MaybeType<string>;
    let smsPt2: MaybeType<string>;

    if (i18n) {
      [smsPt1, smsPt2] = await Promise.all([
        i18n.t('common.smsPt1'),
        i18n.t('common.smsPt2'),
      ]);
    }

    await this.vonage.sms.send({
      to,
      text: `${smsPt1} ${code.toString()}, ${smsPt2}`,
      from: this.configService.getOrThrow('sms.defaultPhoneNumber', {
        infer: true,
      }),
    });
  }
}
