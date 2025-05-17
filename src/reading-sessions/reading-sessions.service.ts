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
import { Between } from 'typeorm';

@Injectable()
export class ReadingSessionsService {
  constructor(
    private readonly readingSessionRepository: ReadingSessionRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly messageRepository: MessageRepository,
    private readonly usersService: UsersService,
    private readonly storiesService: StoriesService,
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
    session.startTime = dto.startTime;
    session.endTime = dto.endTime;

    if (session.startTime > session.endTime) {
      throw new Error('Start time must be before end time');
    }
    if (session.startedAt > session.endedAt) {
      throw new Error('Started at must be before ended at');
    }

    await this.validateSessionOverlap(session);

    return this.readingSessionRepository.create(session);
  }

  private async validateSessionOverlap(session: ReadingSession): Promise<void> {
    // Lấy các session cùng ngày với session mới
    const existingSessions = await this.readingSessionRepository.find({
      where: {
        humanBookId: session.humanBookId,
        startedAt: Between(session.startedAt, session.endedAt),
      },
    });

    // Kiểm tra overlap về giờ trong ngày
    const overlap = existingSessions.some((existing) => {
      return (
        existing.startTime < session.endTime &&
        existing.endTime > session.startTime
      );
    });

    if (overlap) {
      throw new UnprocessableEntityException({
        status: 422,
        message:
          'Khung giờ bạn chọn đã bị trùng với một phiên đọc khác trong ngày này. Vui lòng chọn thời gian khác.',
        errors: {
          sessionOverlap:
            'Session time overlaps with another session on the same day.',
        },
      });
    }
  }

  async findAllSessions(
    queryDto: FindAllReadingSessionsQueryDto,
  ): Promise<ReadingSession[]> {
    return await this.readingSessionRepository.findManyWithPagination({
      filterOptions: queryDto,
      paginationOptions: {
        page: Math.floor(queryDto.offset / queryDto.limit) + 1,
        limit: queryDto.limit,
      },
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
    Object.assign(session, dto);
    return await this.readingSessionRepository.update(id, session);
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
}
