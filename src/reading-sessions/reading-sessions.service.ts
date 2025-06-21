import {
  HttpStatus,
  Injectable,
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
import { MailService } from '@mail/mail.service';

@Injectable()
export class ReadingSessionsService {
  constructor(
    private readonly readingSessionRepository: ReadingSessionRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly messageRepository: MessageRepository,
    private readonly usersService: UsersService,
    private readonly storiesService: StoriesService,
    private readonly storyReviewsService: StoryReviewsService,
    private readonly webRtcService: WebRtcService,
    private readonly notificationService: NotificationsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectQueue('reminder') private readonly reminderQueue: Queue,
    private prisma: PrismaService,
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
    session.startedAt = new Date(
      new Date(dto.startedAt).getTime() +
        (420 - new Date(dto.startedAt).getTimezoneOffset()) * 60000,
    );
    session.endedAt = new Date(
      new Date(dto.endedAt).getTime() +
        (420 - new Date(dto.endedAt).getTimezoneOffset()) * 60000,
    );
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

    await this.notificationService.pushNoti({
      senderId: newReadingSession?.readerId,
      recipientId: newReadingSession?.humanBookId,
      type: NotificationTypeEnum.sessionRequest,
      relatedEntityId: newReadingSession.id,
    });

    return newReadingSession;
  }

  private async validateSessionOverlap(session: ReadingSession): Promise<void> {
    // Lấy các session cùng ngày với session mới
    const existingSessions = await this.readingSessionRepository.find({
      where: {
        humanBookId: session.humanBookId,
        startedAt: LessThanOrEqual(session.endedAt),
        endedAt: MoreThanOrEqual(session.startedAt),
      },
    });

    // Kiểm tra overlap về giờ trong ngày
    const overlap = existingSessions.some((existing) => {
      return (
        existing.startTime <= session.endTime &&
        existing.endTime >= session.startTime
      );
    });

    if (overlap) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          sessionOverlap:
            'Session time overlaps with another session on the same day.',
        },
      });
    }
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

  async updateSession(
    id: number,
    dto: UpdateReadingSessionDto,
  ): Promise<ReadingSession> {
    const session = await this.findOneSession(id);

    if (dto.sessionStatus === 'approved') {
      const registeredMeeting = this.webRtcService.generateToken(session);
      session.sessionUrl = `${this.configService.get('app.frontendDomain', { infer: true })}/reading?channel=session-${session.id}&token=${registeredMeeting.token}`;
    }

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
    return this.readingSessionRepository.update(id, session);
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

  @Cron('30 5 * * *', { timeZone: 'Asia/Ho_Chi_Minh' }) // 05:30 only
  @Cron('0,30 6-22 * * *', { timeZone: 'Asia/Ho_Chi_Minh' }) // 06:00 to 22:30
  @Cron('0 23 * * *', { timeZone: 'Asia/Ho_Chi_Minh' }) // 23:00 only
  async checkAndScheduleReminders() {
    const now = new Date();
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
    for (const session of sessions) {
      const delay = 15 * 60 * 1000; // Delay = 1 minutes

      await this.reminderQueue.add(
        'send-email-and-notify-user',
        { sessionId: session.id },
        {
          delay,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );

      // Update flag to avoid rescheduling
      // await this.prisma.meeting.update({
      //   where: { id: meeting.id },
      //   data: { reminderScheduled: true },
      // });

      // this.logger.log(`Scheduled reminder for meeting ${meeting.id}`);
    }
  }
}
