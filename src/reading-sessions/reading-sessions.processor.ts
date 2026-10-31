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

    const adminId = await this.notificationsService.getAdminId();
    if (adminId) {
      await this.notificationsService.pushNoti({
        senderId: adminId,
        recipientId: session.humanBookId,
        type: NotificationTypeEnum.other,
        relatedEntityId: sessionId,
      });
      await this.notificationsService.pushNoti({
        senderId: adminId,
        recipientId: session.readerId,
        type: NotificationTypeEnum.other,
        relatedEntityId: sessionId,
      });
    }
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

  @Process('send-meeting-request-sent-email')
  async handleMeetingRequestSentEmail(job: Job) {
    const session = await this.readingSessionsService.findOneSession(
      job.data.sessionId,
    );
    if (!session.reader?.email) return;

    await this.mailService.meetingStatus({
      to: session.reader.email,
      data: {
        type: 'sent',
        recipientName: session.reader.fullName || 'Liber',
        huberName: session.humanBook?.fullName || 'Huber',
        ...this.meetingWhen(session),
      },
    });
  }

  @Process('send-meeting-declined-email')
  async handleMeetingDeclinedEmail(job: Job) {
    const session = await this.readingSessionsService.findOneSession(
      job.data.sessionId,
    );
    if (!session.reader?.email) return;

    await this.mailService.meetingStatus({
      to: session.reader.email,
      data: {
        type: 'declined',
        recipientName: session.reader.fullName || 'Liber',
        huberName: session.humanBook?.fullName || 'Huber',
        reason: session.rejectReason,
        ...this.meetingWhen(session),
      },
    });
  }

  @Process('send-meeting-auto-canceled-email')
  async handleMeetingAutoCanceledEmail(job: Job) {
    const session = await this.readingSessionsService.findOneSession(
      job.data.sessionId,
    );
    if (!session.reader?.email) return;

    await this.mailService.meetingStatus({
      to: session.reader.email,
      data: {
        type: 'autoCanceled',
        recipientName: session.reader.fullName || 'Liber',
        huberName: session.humanBook?.fullName || 'Huber',
        ...this.meetingWhen(session),
      },
    });
  }

  @Process('send-meeting-canceled-email')
  async handleMeetingCanceledEmail(job: Job) {
    const session = await this.readingSessionsService.findOneSession(
      job.data.sessionId,
    );
    if (!session.humanBook?.email) return;

    await this.mailService.meetingStatus({
      to: session.humanBook.email,
      data: {
        type: 'canceled',
        recipientName: session.humanBook.fullName || 'Huber',
        liberName: session.reader?.fullName || 'Liber',
        reason: session.rejectReason,
        ...this.meetingWhen(session),
      },
    });
  }

  private meetingWhen(session: {
    startedAt: Date;
    startTime: string;
    endTime: string;
  }) {
    return {
      meetingDate: session.startedAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      meetingTime: `${session.startTime} - ${session.endTime}`,
    };
  }
}
