import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MailService } from '@mail/mail.service';
import { MailerModule } from '@mailer/mailer.module';
import { MailSchedulerService } from '@mail/mail-scheduler.service';
import { MailProcessor } from '@mail/mail.processor';
import { MailPreviewController } from './mail-preview.controller';

@Module({
  imports: [
    ConfigModule,
    MailerModule,
    BullModule.registerQueue({ name: 'mail' }),
  ],
  providers: [MailService, MailSchedulerService, MailProcessor],
  controllers: [MailPreviewController],
  exports: [MailService, MailSchedulerService, BullModule],
})
export class MailModule {}
