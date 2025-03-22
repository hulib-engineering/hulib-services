import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingSession, ReadingSessionStatus } from './domain/reading-session';
import { Feedback } from './domain/feedback';
import { Message } from './domain/message';
import { ReadingSessionRepository } from './infrastructure/persistence/relational/repositories/reading-sessions.repository';
import { FeedbackRepository } from './infrastructure/persistence/relational/repositories/feedbacks.repository';
import { MessageRepository } from './infrastructure/persistence/relational/repositories/messages.repository';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { FindAllReadingSessionsQueryDto } from './dto/reading-session/find-all-reading-sessions-query.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';

@Injectable()
export class ReadingSessionsService {
  constructor(
    private readonly readingSessionRepository: ReadingSessionRepository,
    private readonly feedbackRepository: FeedbackRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async createSession(dto: CreateReadingSessionDto): Promise<ReadingSession> {
    const session = new ReadingSession();
    session.humanBookId = dto.humanBookId;
    session.readerId = dto.readerId;
    session.storyId = dto.storyId;
    session.authorScheduleId = dto.authorScheduleId;
    session.sessionUrl = dto.sessionUrl;
    session.note = dto.note;
    session.sessionStatus = ReadingSessionStatus.UNINITIALIZED;

    return await this.readingSessionRepository.create(session);
  }

  async findAllSessions(
    queryDto: FindAllReadingSessionsQueryDto,
  ): Promise<ReadingSession[]> {
    return await this.readingSessionRepository.findManyWithPagination({
      filterOptions: queryDto,
      paginationOptions: {
        page: 1,
        limit: 10,
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
    const session = await this.findOneSession(id);

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
