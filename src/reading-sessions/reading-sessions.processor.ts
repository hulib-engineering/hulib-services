import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ReadingSessionsService } from '@reading-sessions/reading-sessions.service';
import { MailService } from '@mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

@Processor('reminder')
export class ReadingSessionsProcessor {
  constructor(
    private readingSessionsService: ReadingSessionsService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {}

  @Process('send-email-and-notify-user')
  async handleSendEmailAndNotifyParticipants(job: Job) {
    const { sessionId } = job.data;
    const session = await this.readingSessionsService.findOneSession(sessionId);

    if (!!session.humanBook.email) {
      await this.mailService.remindParticipants({
        to: session.humanBook.email,
        data: {
          name: session.humanBook.fullName ?? '',
          isHuber: true,
          sessionUrl: session.sessionUrl,
        },
      });
    }
    if (!!session.reader.email) {
      await this.mailService.remindParticipants({
        to: session.reader.email,
        data: {
          name: session.reader.fullName ?? '',
          isHuber: false,
          sessionUrl: session.sessionUrl,
        },
      });
    }

    await this.notificationsService.pushNoti({
      senderId: 1,
      recipientId: session.humanBookId,
      type: NotificationTypeEnum.other,
      relatedEntityId: sessionId,
    });
    await this.notificationsService.pushNoti({
      senderId: 1,
      recipientId: session.readerId,
      type: NotificationTypeEnum.other,
      relatedEntityId: sessionId,
    });
  }

  @Process('send-booking-email')
  async handleSendBookingEmail(job: Job) {
    const { sessionId } = job.data;
    const session = await this.readingSessionsService.findOneSession(sessionId);

    const sessionDate = session.startedAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const sessionTime = `${session.startTime} - ${session.endTime}`;

    if (session.humanBook?.email) {
      await this.mailService.sendBookingEmail({
        to: session.humanBook.email,
        data: {
          huberName: session.humanBook.fullName || '',
          liberName: session.reader.fullName || '',
          sessionTime,
          sessionDate,
          storyTitle: session.story?.title || '',
          message: session.note || '',
        },
      });
    }
  }
}
