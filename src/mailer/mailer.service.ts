import { Injectable } from '@nestjs/common';
import fs from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import { AllConfigType } from '@config/config.type';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private google: OAuth2Client;

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    const isLocalDev =
      this.configService.get('app.nodeEnv', { infer: true }) === 'local';

    if (isLocalDev) {
      this.google = {} as unknown as OAuth2Client;
      return;
    }
    this.google = new OAuth2Client(
      configService.get('google.clientId', { infer: true }),
      configService.get('google.clientSecret', { infer: true }),
    );

    this.google.setCredentials({
      refresh_token: configService.get('google.refreshToken', { infer: true }),
    });
    this.transporter = nodemailer.createTransport({
      host: configService.get('mail.host', { infer: true }),
      port: configService.get('mail.port', { infer: true }),
      ignoreTLS: configService.get('mail.ignoreTLS', { infer: true }),
      secure: configService.get('mail.secure', { infer: true }),
      requireTLS: configService.get('mail.requireTLS', { infer: true }),
      auth:
        this.configService.get('app.nodeEnv', { infer: true }) === 'development'
          ? {
              user: configService.get('mail.user', { infer: true }),
              pass: configService.get('mail.password', { infer: true }),
            }
          : {
              type: 'OAuth2',
              user: configService.get('mail.user', { infer: true }),
              clientId: configService.get('google.clientId', { infer: true }),
              clientSecret: configService.get('google.clientSecret', {
                infer: true,
              }),
              refreshToken: configService.get('google.refreshToken', {
                infer: true,
              }),
              accessToken: this.google.getAccessToken(),
            },
    });
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;
    if (templatePath) {
      const template = await fs.readFile(templatePath, 'utf-8');
      html = Handlebars.compile(template, {
        strict: true,
      })(context);
    }

    try {
      await this.transporter.sendMail({
        ...mailOptions,
        from: mailOptions.from
          ? mailOptions.from
          : `"${this.configService.get('mail.defaultName', {
              infer: true,
            })}" <${this.configService.get('mail.defaultEmail', {
              infer: true,
            })}>`,
        html: mailOptions.html ? mailOptions.html : html,
      });
    } catch (e) {
      console.error('Error sending email: ', e);
    }
  }
}
