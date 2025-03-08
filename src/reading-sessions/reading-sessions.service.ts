import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingSession } from './entities/reading-session.entity';
import { ReadingSessionParticipant } from './entities/reading-session-participant.entity';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { CreateReadingSessionParticipantDto } from './dto/reading-session-participant/create-reading-session-participant.dto';

@Injectable()
export class ReadingSessionsService {
  constructor(
    @InjectRepository(ReadingSession)
    private readonly readingSessionRepo: Repository<ReadingSession>,
    @InjectRepository(ReadingSessionParticipant)
    private readonly participantRepo: Repository<ReadingSessionParticipant>,
  ) {}

  async createSession(dto: CreateReadingSessionDto): Promise<ReadingSession> {
    const session = this.readingSessionRepo.create(dto);
    return await this.readingSessionRepo.save(session);
  }

  async findAllSessions(): Promise<ReadingSession[]> {
    return await this.readingSessionRepo.find({ relations: ['participants'] });
  }

  async findOneSession(id: string): Promise<ReadingSession> {
    const session = await this.readingSessionRepo.findOne({
      where: { id },
      relations: ['participants'],
    });
    if (!session) throw new NotFoundException('Reading session not found');
    return session;
  }

  async updateSession(
    id: string,
    dto: UpdateReadingSessionDto,
  ): Promise<ReadingSession> {
    await this.readingSessionRepo.update(id, dto);
    return this.findOneSession(id);
  }

  async deleteSession(id: string): Promise<void> {
    await this.readingSessionRepo.delete(id);
  }

  async addParticipant(
    dto: CreateReadingSessionParticipantDto,
  ): Promise<ReadingSessionParticipant> {
    const participant = this.participantRepo.create(dto);
    return await this.participantRepo.save(participant);
  }

  async findAllParticipants(): Promise<ReadingSessionParticipant[]> {
    return await this.participantRepo.find();
  }
}
