import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

import { MaybeType } from '../utils/types/maybe.type';
import { MailerService } from '../mailer/mailer.service';
import path from 'path';
import { AllConfigType } from '../config/config.type';
import { User } from '../users/domain/user';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(
    mailData: MailData<{ code: number; name: string }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let dear: MaybeType<string>;
    let thank: MaybeType<string>;
    let guide: MaybeType<string>;
    let contact: MaybeType<string>;
    let welcome: MaybeType<string>;

    let regard: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, dear, thank, guide, contact, welcome, regard] =
        await Promise.all([
          i18n.t('common.confirmEmail'),
          i18n.t('common.dear'),
          i18n.t('confirm-email.thank'),
          i18n.t('confirm-email.guide'),
          i18n.t('confirm-email.contact'),
          i18n.t('confirm-email.welcome'),
          i18n.t('common.bestRegards'),
        ]);
    }

    const url = this.configService.getOrThrow('app.frontendDomain', {
      infer: true,
    });

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${mailData.data.code.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        fullname: mailData.data.name.toString(),
        url: url.toString(),
        code: mailData.data.code.toString().split('').join(' '),
        dear,
        thank,
        guide,
        contact,
        welcome,
        regard,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{
      name: User['fullName'];
      hash: string;
      tokenExpires: number;
      tokenExpiresIn: string;
    }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let dear: MaybeType<string>;
    let resetPasswordTitle: MaybeType<string>;
    let guide: MaybeType<string>;
    let warningPt1: MaybeType<string>;
    let warningPt2: MaybeType<string>;
    let contact: MaybeType<string>;
    let regard: MaybeType<string>;

    if (i18n) {
      [
        resetPasswordTitle,
        dear,
        guide,
        warningPt1,
        warningPt2,
        contact,
        regard,
      ] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('common.dear'),
        i18n.t('reset-password.guide'),
        i18n.t('reset-password.warningPt1'),
        i18n.t('reset-password.warningPt2'),
        i18n.t('reset-password.contact'),
        i18n.t('common.bestRegards'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/auth/reset-password',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        fullname: mailData.data.name,
        url: url.toString(),
        expirationPeriod: mailData.data.tokenExpiresIn,
        dear,
        guide,
        warningPt1,
        warningPt2,
        contact,
        regard,
      },
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-new-email.text1'),
        i18n.t('confirm-new-email.text2'),
        i18n.t('confirm-new-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }
}
