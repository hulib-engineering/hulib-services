import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ReadingSession, ReadingSessionStatus } from './domain/reading-session';
import { Feedback } from './domain/feedback';
import { Message } from './domain/message';
import { ReadingSessionRepository } from './infrastructure/persistence/relational/repositories/reading-sessions.repository';
import { FeedbackRepository } from './infrastructure/persistence/relational/repositories/feedbacks.repository';
import { MessageRepository } from './infrastructure/persistence/relational/repositories/messages.repository';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { FindAllReadingSessionsQueryDto } from './dto/reading-session/find-all-reading-sessions-query.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { UsersService } from '@users/users.service';
import { StoriesService } from '@stories/stories.service';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { User } from '@users/domain/user';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import { Cron } from '@nestjs/schedule';

import { AllConfigType } from '@config/config.type';
import { WebRtcService } from '../web-rtc/web-rtc.service';
import { StoryReviewsService } from '@story-reviews/story-reviews.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '@prisma-client/prisma-client.service';

@Injectable()
export class ReadingSessionsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly readingSessionRepository: ReadingSessionRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly messageRepository: MessageRepository,
    private readonly usersService: UsersService,
    private readonly storiesService: StoriesService,
    private readonly storyReviewsService: StoryReviewsService,
    private readonly webRtcService: WebRtcService,
    private readonly notificationService: NotificationsService,
    private prisma: PrismaService,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectQueue('reminder') private readonly reminderQueue: Queue,
  ) {}

  async createSession(dto: CreateReadingSessionDto): Promise<ReadingSession> {
    const huber = await this.usersService.findById(dto.humanBookId);

    if (!huber) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `huberNotFound`,
      });
    }

    const liber = await this.usersService.findById(dto.readerId);

    if (!liber) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `liberNotFound`,
      });
    }

    const story = await this.storiesService.findDetailedStory(dto.storyId);

    if (!story) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: `storyNotFound`,
      });
    }

    const session = new ReadingSession();
    session.humanBookId = dto.humanBookId;
    session.readerId = dto.readerId;
    session.storyId = dto.storyId;
    // Will be replaced by webRTC link
    session.sessionUrl = '';
    session.note = dto.note;
    session.sessionStatus = ReadingSessionStatus.PENDING;
    session.startedAt = new Date(dto.startedAt);
    session.endedAt = new Date(dto.endedAt);
    // session.startedAt = new Date(
    //   new Date(dto.startedAt).getTime() +
    //     (7 * 60 - new Date(dto.startedAt).getTimezoneOffset()) * 60000,
    // );
    // session.endedAt = new Date(
    //   new Date(dto.endedAt).getTime() +
    //     (7 * 60 - new Date(dto.endedAt).getTimezoneOffset()) * 60000,
    // );
    session.startTime = dto.startTime;
    session.endTime = dto.endTime;

    if (session.startTime > session.endTime) {
      throw new Error('Start time must be before end time');
    }
    if (session.startedAt > session.endedAt) {
      throw new Error('Started at must be before ended at');
    }

    await this.validateSessionOverlap(session);

    const newReadingSession =
      await this.readingSessionRepository.create(session);

    await Promise.all([
      this.notificationService.pushNoti({
        senderId: newReadingSession?.readerId,
        recipientId: newReadingSession?.humanBookId,
        type: NotificationTypeEnum.sessionRequest,
        relatedEntityId: newReadingSession.id,
      }),
      this.reminderQueue.add(
        'send-booking-email',
        { sessionId: newReadingSession.id },
        {
          removeOnComplete: true,
          removeOnFail: true,
        },
      ),
    ]);

    return newReadingSession;
  }

  private async validateSessionOverlap(session: ReadingSession): Promise<void> {
    const sameDay = new Date(session.startedAt).toDateString();

    // Lấy các session cùng ngày với session mới
    const existingSessions = await this.readingSessionRepository.find({
      where: {
        humanBookId: session.humanBookId,
        startedAt: LessThanOrEqual(session.endedAt),
        endedAt: MoreThanOrEqual(session.startedAt),
      },
    });

    // Kiểm tra xem có session nào trùng thời gian với session mới
    const hasOverlap = existingSessions.some((existing) => {
      const isSameDay = new Date(existing.startedAt).toDateString() === sameDay;
      const isTimeOverlap = this.isTimeOverlap(
        existing.startTime,
        existing.endTime,
        session.startTime,
        session.endTime,
      );
      return isSameDay && isTimeOverlap;
    });

    if (hasOverlap) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          sessionOverlap:
            'Session time overlaps with another session on the same day.',
        },
      });
    }
  }

  private isTimeOverlap(
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string,
  ): boolean {
    const start1 = this.timeStringToMinutes(startTime1);
    const end1 = this.timeStringToMinutes(endTime1);
    const start2 = this.timeStringToMinutes(startTime2);
    const end2 = this.timeStringToMinutes(endTime2);
    return start1 < end2 && start2 < end1;
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async findAllSessions(
    queryDto: FindAllReadingSessionsQueryDto,
    userId: User['id'],
  ): Promise<ReadingSession[]> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    let paginationOptions: { page: number; limit: number } | undefined =
      undefined;
    if (queryDto.limit && queryDto.offset) {
      paginationOptions = {
        page: Math.floor(queryDto.offset / queryDto.limit) + 1,
        limit: queryDto.limit,
      };
    }

    return this.readingSessionRepository.findManyWithPagination({
      filterOptions: {
        ...queryDto,
        userId: typeof userId === 'string' ? Number(userId) : userId,
      },
      paginationOptions,
    });
  }

  async findOneSession(id: number): Promise<ReadingSession> {
    const session = await this.readingSessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Reading session #${id} not found`);
    }
    return session;
  }

  async updateSession(id: number, dto: UpdateReadingSessionDto): Promise<void> {
    const session = await this.findOneSession(id);

    if (
      session.sessionStatus === ReadingSessionStatus.APPROVED &&
      dto.presurvey
    ) {
      await this.storyReviewsService.create({
        rating: 0,
        preRating: dto.presurvey[1].rating,
        title: '',
        comment: '',
        userId: session.readerId,
        storyId: session.storyId,
      });
      await this.readingSessionRepository.update(id, {
        preRating: dto.presurvey[2].rating,
      });
      await this.usersService.addFeedback(
        session.readerId,
        session.humanBookId,
        {
          preRating: dto.presurvey[3].rating,
          rating: 0,
        },
      );
    }

    if (dto.sessionStatus === 'finished') {
      await this.notificationService.pushNoti({
        senderId: 1,
        recipientId: session.readerId,
        type: NotificationTypeEnum.sessionFinish,
        relatedEntityId: session.id,
      });
    }

    if (session.sessionStatus === ReadingSessionStatus.FINISHED) {
      if (!!dto.sessionFeedback) {
        await this.readingSessionRepository.update(id, {
          ...dto.sessionFeedback,
        });
      }
      if (!!dto.storyReview) {
        const { content, ...rest } = dto.storyReview;
        await this.storyReviewsService.updateByUserIdAndStoryId(
          session.readerId,
          session.storyId,
          {
            ...rest,
            comment: content,
          },
        );
        await this.notificationService.pushNoti({
          senderId: session.readerId,
          recipientId: session.humanBookId,
          type: NotificationTypeEnum.reviewStory,
          relatedEntityId: session.storyId,
        });
      }
      if (!!dto.huberFeedback) {
        await this.usersService.editFeedback(
          session.readerId,
          session.humanBookId,
          dto.huberFeedback,
        );
      }
    }
    Object.assign(session, dto);
    await this.readingSessionRepository.update(id, session);

    if (dto.sessionStatus === 'approved') {
      await this.notificationService.pushNoti({
        senderId: session.humanBookId,
        recipientId: session.readerId,
        type: NotificationTypeEnum.approveReadingSession,
        relatedEntityId: session.id,
      });
    }

    if (dto.sessionStatus === 'rejected') {
      await this.notificationService.pushNoti({
        senderId: session.humanBookId,
        recipientId: session.readerId,
        type: NotificationTypeEnum.rejectReadingSession,
        relatedEntityId: session.id,
      });
    }

    if (dto.sessionStatus === 'canceled') {
      await this.notificationService.pushNoti({
        senderId: session.readerId,
        recipientId: session.humanBookId,
        type: NotificationTypeEnum.cancelReadingSession,
        relatedEntityId: session.id,
      });
    }
  }

  async deleteSession(id: number): Promise<void> {
    await this.findOneSession(id);
    await this.readingSessionRepository.softDelete(id);
  }

  async updateSessionStatus(
    id: number,
    status: ReadingSessionStatus,
  ): Promise<ReadingSession> {
    const session = await this.findOneSession(id);
    session.sessionStatus = status;
    return await this.readingSessionRepository.update(id, session);
  }

  async addFeedback(
    id: number,
    feedbackDto: { rating: number; content?: string },
  ): Promise<ReadingSession> {
    // const session = await this.findOneSession(id);

    const feedback = new Feedback();
    feedback.readingSessionId = id;
    feedback.rating = feedbackDto.rating;
    feedback.content = feedbackDto.content;

    await this.feedbackRepository.create(feedback);

    return await this.findOneSession(id);
  }

  async addMessage(
    id: number,
    messageDto: { content: string; senderId: number },
  ): Promise<ReadingSession> {
    const session = await this.findOneSession(id);

    const message = new Message();
    message.readingSessionId = id;
    message.humanBookId = session.humanBookId;
    message.readerId = session.readerId;
    message.content = messageDto.content;

    await this.messageRepository.create(message);

    return await this.findOneSession(id);
  }

  async getSessionFeedbacks(id: number): Promise<Feedback[]> {
    await this.findOneSession(id);
    return await this.feedbackRepository.findByReadingSessionId(id);
  }

  async getSessionMessages(id: number): Promise<Message[]> {
    await this.findOneSession(id);
    return await this.messageRepository.findByReadingSessionId(id);
  }

  @Cron('0 */30 * * * *', { timeZone: 'UTC' }) // Every 30 mins, starting from 00:00 UTC
  async checkAndScheduleReminders() {
    const now = new Date();
    this.logger.log(
      `[CRON] Running reminder scheduler at ${now.toISOString()}`,
    );

    await this.scheduleRemindersForUpcomingSessions(now);

    await this.markOverdueSessionsAsMissed(now);
  }

  private async scheduleRemindersForUpcomingSessions(now: Date) {
    const targetStart = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    const sessions = await this.prisma.readingSession.findMany({
      where: {
        startedAt: {
          gte: new Date(targetStart.getTime() - 5 * 60 * 1000), // 5 min buffer before
          lt: new Date(targetStart.getTime() + 5 * 60 * 1000), // 5 min buffer after
        },
        sessionStatus: ReadingSessionStatus.APPROVED,
      },
    });
    // console.log('matched', sessions);

    for (const session of sessions) {
      const detailedSession = await this.findOneSession(session.id);
      const registeredSession =
        this.webRtcService.generateToken(detailedSession);
      const sessionUrl = `${this.configService.get('app.frontendDomain', { infer: true })}/reading?channel=session-${session.id}&token=${registeredSession.token}&expireAt=${registeredSession.expireAt}`;
      await this.updateSession(session.id, { sessionUrl });

      const delay = 60 * 1000; // Delay = 1 minutes

      await this.reminderQueue.add(
        'send-email-and-notify-user',
        { sessionId: session.id },
        {
          delay,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    }
  }

  private async markOverdueSessionsAsMissed(now: Date) {
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const overdueSessions = await this.prisma.readingSession.findMany({
      where: {
        startedAt: {
          lt: thirtyMinutesAgo,
        },
        sessionStatus: ReadingSessionStatus.APPROVED,
        OR: [
          {
            preRating: 0,
          },
          {
            rating: 0,
          },
        ],
      },
    });

    if (overdueSessions.length > 0) {
      this.logger.log(
        `[CRON] Found ${overdueSessions.length} overdue sessions to mark as missed`,
      );

      for (const session of overdueSessions) {
        await this.prisma.readingSession.update({
          where: { id: session.id },
          data: { sessionStatus: ReadingSessionStatus.MISSED },
        });

        await this.notificationService.pushNoti({
          senderId: 1,
          recipientId: session.readerId,
          type: NotificationTypeEnum.missReadingSession,
          relatedEntityId: session.id,
        });

        this.logger.log(`[CRON] Marked session ${session.id} as MISSED`);
      }
    }
  }
}
