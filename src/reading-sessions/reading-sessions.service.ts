import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ReadingSession, ReadingSessionStatus } from './domain/reading-session';
import { Message } from './domain/message';
import { ReadingSessionRepository } from './reading-session.repository';
import { MessageRepository } from './message.repository';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import {
  DEFAULT_READING_SESSIONS_LIMIT,
  DEFAULT_READING_SESSIONS_PAGE,
  FindAllReadingSessionsQueryDto,
} from './dto/reading-session/find-all-reading-sessions-query.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { UsersService } from '@users/users.service';
import { StoriesService } from '@stories/stories.service';
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
import { ReadingSessionPageResponseDto } from '@utils/dto/pagination-response.dto';
import { pagination } from '@utils/pagination';

const AUTO_CANCEL_REASON =
  'Huber did not respond before the session start time';

// Matches how far ahead of the start the meeting link and Agora token exist.
const ATTENDANCE_GRACE_MS = 30 * 60 * 1000;

const TERMINAL_SESSION_STATUSES: ReadingSessionStatus[] = [
  ReadingSessionStatus.CANCELED,
  ReadingSessionStatus.MISSED,
  ReadingSessionStatus.FINISHED,
  ReadingSessionStatus.REJECTED,
];

// `offset` wins over `page` so a client that sends both is never ambiguous,
// and both default to the first page rather than to "unpaginated".
function resolvePage(
  page: number | undefined,
  offset: number | undefined,
  limit: number,
): number {
  if (offset !== undefined) {
    return Math.floor(offset / limit) + 1;
  }
  return page ?? DEFAULT_READING_SESSIONS_PAGE;
}

@Injectable()
export class ReadingSessionsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly readingSessionRepository: ReadingSessionRepository,
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
    const existingSessions =
      await this.readingSessionRepository.findOverlapping(
        session.humanBookId,
        session.startedAt,
        session.endedAt,
      );

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
  ): Promise<ReadingSessionPageResponseDto<ReadingSession>> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    // `offset=0` is falsy, so a truthiness check here would silently drop
    // pagination for the very first page and return every row instead.
    const limit = queryDto.limit ?? DEFAULT_READING_SESSIONS_LIMIT;
    const page = resolvePage(queryDto.page, queryDto.offset, limit);
    const paginationOptions = { page, limit };

    const filterOptions = {
      ...queryDto,
      userId: typeof userId === 'string' ? Number(userId) : userId,
    };

    const [{ data, count }, counts] = await Promise.all([
      this.readingSessionRepository.findManyWithPagination({
        filterOptions,
        paginationOptions,
      }),
      this.readingSessionRepository.countByFilterOption(filterOptions),
    ]);

    const result = pagination(data, count, paginationOptions);
    return { ...result, meta: { ...result.meta, counts } };
  }

  async findOneSession(id: number): Promise<ReadingSession> {
    const session = await this.readingSessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Reading session #${id} not found`);
    }
    return session;
  }

  async markAttendance(id: number, userId: number): Promise<void> {
    const session = await this.findOneSession(id);

    const role =
      session.humanBookId === userId
        ? 'huber'
        : session.readerId === userId
          ? 'reader'
          : null;

    if (!role) {
      throw new ForbiddenException({
        status: HttpStatus.FORBIDDEN,
        error: 'notSessionParticipant',
      });
    }

    // The Agora token only becomes reachable about 30 min before the start (see
    // scheduleRemindersForUpcomingSessions), so a stamp earlier than that is not
    // a real join and must not count as attendance.
    const earliestJoinAt = new Date(
      session.startedAt.getTime() - ATTENDANCE_GRACE_MS,
    );
    if (new Date() < earliestJoinAt) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'tooEarlyToRecordAttendance',
      });
    }

    await this.readingSessionRepository.markAttendance(id, role);
  }

  async updateSession(id: number, dto: UpdateReadingSessionDto): Promise<void> {
    const session = await this.findOneSession(id);

    // Without this, a huber approving just after the cron auto-cancelled the
    // session would flip it back to approved — an unjoinable session with a
    // contradictory status.
    if (
      (dto.sessionStatus === ReadingSessionStatus.APPROVED ||
        dto.sessionStatus === ReadingSessionStatus.REJECTED) &&
      TERMINAL_SESSION_STATUSES.includes(session.sessionStatus)
    ) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        error: `sessionAlready${session.sessionStatus}`,
      });
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
      // Keep the in-memory session in sync — it's re-persisted wholesale
      // below (Object.assign(session, dto) + a final update), which would
      // otherwise clobber this targeted write back to its stale value.
      session.preRating = dto.presurvey[2].rating;
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
      const adminId = await this.notificationService.getAdminId();
      if (adminId) {
        await this.notificationService.pushNoti({
          senderId: adminId,
          recipientId: session.readerId,
          type: NotificationTypeEnum.sessionFinish,
          relatedEntityId: session.id,
        });
      }
      await this.notificationService.softDeleteSessionReminderNotification(id);
    }

    if (session.sessionStatus === ReadingSessionStatus.FINISHED) {
      if (!!dto.sessionFeedback) {
        await this.readingSessionRepository.update(id, {
          ...dto.sessionFeedback,
        });
        // Same reason as the presurvey update above — keep `session` in
        // sync so the final blanket update doesn't clobber it.
        session.rating = dto.sessionFeedback.rating;
        session.preRating = dto.sessionFeedback.preRating;
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

  async getSessionMessages(id: number): Promise<Message[]> {
    await this.findOneSession(id);
    return await this.messageRepository.findByReadingSessionId(id);
  }

  private formatSessionWhen(
    session: Pick<ReadingSession, 'startTime' | 'endTime' | 'startedAt'>,
  ): string {
    const sessionDate = session.startedAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `${session.startTime} - ${session.endTime}, ${sessionDate}`;
  }

  // Deliberately neutral rather than accusatory: a huber can look absent purely
  // because the attend beacon never arrived, and we would rather ask than accuse.
  private buildHuberNoShowNote(
    session: Pick<ReadingSession, 'startTime' | 'endTime' | 'startedAt'>,
  ): string {
    return `We couldn't confirm your participation in the session (${this.formatSessionWhen(session)}). If anything got in the way on your side, please let us know so we can improve the experience for everyone.`;
  }

  private buildAutoCancelNote(
    session: Pick<ReadingSession, 'startTime' | 'endTime' | 'startedAt'>,
    huberName: string,
  ): string {
    return `Sorry! Your meeting request (${this.formatSessionWhen(session)}) has been auto cancelled because ${huberName} has not responded yet.`;
  }

  @Cron('0 */30 * * * *', { timeZone: 'UTC' }) // Every 30 mins, starting from 00:00 UTC
  async checkAndScheduleReminders() {
    const now = new Date();
    this.logger.log(
      `[CRON] Running reminder scheduler at ${now.toISOString()}`,
    );

    await this.scheduleRemindersForUpcomingSessions(now);

    await this.autoCancelStalePendingSessions(now);

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

  // A pending session whose start time has passed is hard proof the huber never
  // responded, so no attendance data is needed. Detection latency is up to one
  // cron interval (30 min) after the start time.
  private async autoCancelStalePendingSessions(now: Date) {
    const staleSessions = await this.prisma.readingSession.findMany({
      where: {
        startedAt: { lt: now },
        sessionStatus: ReadingSessionStatus.PENDING,
      },
      include: { humanBook: { select: { fullName: true } } },
    });

    if (staleSessions.length === 0) {
      return;
    }

    this.logger.log(
      `[CRON] Found ${staleSessions.length} unanswered sessions to auto cancel`,
    );

    for (const session of staleSessions) {
      await this.prisma.readingSession.update({
        where: { id: session.id },
        data: {
          sessionStatus: ReadingSessionStatus.CANCELED,
          rejectReason: AUTO_CANCEL_REASON,
        },
      });

      await this.notificationService.softDeleteSessionReminderNotification(
        session.id,
      );

      const adminId = await this.notificationService.getAdminId();
      if (adminId) {
        await this.notificationService.pushNoti({
          senderId: adminId,
          recipientId: session.readerId,
          type: NotificationTypeEnum.autoCancelReadingSession,
          relatedEntityId: session.id,
          extraNote: this.buildAutoCancelNote(
            session,
            session.humanBook?.fullName ?? '',
          ),
        });
      }

      this.logger.log(`[CRON] Auto canceled session ${session.id}`);
    }
  }

  private async markOverdueSessionsAsMissed(now: Date) {
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // A session is only "missed" when the huber never joined. Ratings are a
    // reader action taken after the call, so they cannot prove absence.
    const overdueSessions = await this.prisma.readingSession.findMany({
      where: {
        startedAt: {
          lt: thirtyMinutesAgo,
        },
        sessionStatus: ReadingSessionStatus.APPROVED,
        huberJoinedAt: null,
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

        await this.notificationService.softDeleteSessionReminderNotification(
          session.id,
        );

        const adminId = await this.notificationService.getAdminId();
        if (adminId) {
          await this.notificationService.pushNoti({
            senderId: adminId,
            recipientId: session.readerId,
            type: NotificationTypeEnum.missReadingSession,
            relatedEntityId: session.id,
          });
          await this.notificationService.pushNoti({
            senderId: adminId,
            recipientId: session.humanBookId,
            type: NotificationTypeEnum.huberNoShowReadingSession,
            relatedEntityId: session.id,
            extraNote: this.buildHuberNoShowNote(session),
          });
        }

        this.logger.log(`[CRON] Marked session ${session.id} as MISSED`);
      }
    }
  }
}
