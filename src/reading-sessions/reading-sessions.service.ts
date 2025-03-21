import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReadingSession,
  ReadingSessionStatus,
} from './entities/reading-session.entity';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { FindAllReadingSessionsQueryDto } from './dto/reading-session/find-all-reading-sessions-query.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';

@Injectable()
export class ReadingSessionsService {
  constructor(
    @InjectRepository(ReadingSession)
    private readonly readingSessionRepo: Repository<ReadingSession>,
  ) {}

  async createSession(dto: CreateReadingSessionDto): Promise<ReadingSession> {
    const session = this.readingSessionRepo.create({
      humanBookId: dto.humanBookId,
      readerId: dto.readerId,
      storyId: dto.storyId,
      authorScheduleId: dto.authorScheduleId,
      sessionUrl: dto.sessionUrl,
      note: dto.note,
      sessionStatus: ReadingSessionStatus.UNINITIALIZED,
    });

    return await this.readingSessionRepo.save(session);
  }

  async findAllSessions(
    queryDto: FindAllReadingSessionsQueryDto,
  ): Promise<ReadingSession[]> {
    const query = this.readingSessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.humanBook', 'humanBook')
      .leftJoinAndSelect('session.reader', 'reader')
      .leftJoinAndSelect('session.story', 'story')
      .leftJoinAndSelect('session.authorSchedule', 'schedule')
      .leftJoinAndSelect('session.feedbacks', 'feedback')
      .leftJoinAndSelect('session.messages', 'message');

    if (queryDto.humanBookId) {
      query.andWhere('session.humanBookId = :humanBookId', {
        humanBookId: queryDto.humanBookId,
      });
    }

    if (queryDto.readerId) {
      query.andWhere('session.readerId = :readerId', {
        readerId: queryDto.readerId,
      });
    }

    if (queryDto.sessionStatus) {
      query.andWhere('session.sessionStatus = :status', {
        status: queryDto.sessionStatus,
      });
    }

    return await query.getMany();
  }

  async findOneSession(id: number): Promise<ReadingSession> {
    const session = await this.readingSessionRepo.findOne({
      where: { id },
      relations: [
        'humanBook',
        'reader',
        'story',
        'authorSchedule',
        'feedbacks',
        'messages',
      ],
    });

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

    Object.assign(session, {
      ...dto,
      updatedAt: new Date(),
    });

    return await this.readingSessionRepo.save(session);
  }

  async deleteSession(id: number): Promise<void> {
    const session = await this.findOneSession(id);

    session.deletedAt = new Date();
    await this.readingSessionRepo.save(session);
  }

  async updateSessionStatus(
    id: number,
    status: ReadingSessionStatus,
  ): Promise<ReadingSession> {
    const session = await this.findOneSession(id);

    session.sessionStatus = status;
    session.updatedAt = new Date();

    return await this.readingSessionRepo.save(session);
  }

  async addFeedback(
    id: number,
    feedback: { rating: number; content?: string },
  ): Promise<ReadingSession> {
    const session = await this.findOneSession(id);

    // Assuming feedback is handled by a separate service
    // This is just to show the relationship

    return session;
  }

  async addMessage(
    id: number,
    message: { content: string; senderId: number },
  ): Promise<ReadingSession> {
    const session = await this.findOneSession(id);

    // Assuming message is handled by a separate service
    // This is just to show the relationship

    return session;
  }
}
