import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingSession } from './entities/reading-session.entity';
import { ReadingSessionParticipant } from './entities/reading-session-participant.entity';
import { CreateReadingSessionDto } from './dto/reading-session/create-reading-session.dto';
import { UpdateReadingSessionDto } from './dto/reading-session/update-reading-session.dto';
import { CreateReadingSessionParticipantsDto } from './dto/reading-session-participant/create-reading-session-participants.dto';
import { FindAllReadingSessionsQueryDto } from './dto/reading-session/find-all-reading-sessions-query.dto';

@Injectable()
export class ReadingSessionsService {
  constructor(
    @InjectRepository(ReadingSession)
    private readonly readingSessionRepo: Repository<ReadingSession>,
    @InjectRepository(ReadingSessionParticipant)
    private readonly participantRepo: Repository<ReadingSessionParticipant>,
  ) {}

  async createSession(
    dto: CreateReadingSessionDto,
    hostId: number,
  ): Promise<ReadingSession> {
    const session = this.readingSessionRepo.create({
      ...dto,
      hostId,
    });
    return await this.readingSessionRepo.save(session);
  }

  async findAllSessions(
    queryDto: FindAllReadingSessionsQueryDto,
  ): Promise<ReadingSession[]> {
    const { hostId } = queryDto;
    const query = this.readingSessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.participants', 'participant');

    if (hostId) {
      query.where('session.hostId = :hostId', { hostId });
    }

    const sessions = await query.getMany();
    return sessions;
  }

  async findOneSession(id: string, hostId: number): Promise<ReadingSession> {
    const session = await this.readingSessionRepo.findOne({
      where: {
        id,
        hostId,
      },
      relations: ['participants'],
    });
    if (!session) throw new NotFoundException('Reading session not found');
    return session;
  }

  async updateSession(
    id: string,
    hostId: number,
    dto: UpdateReadingSessionDto,
  ): Promise<ReadingSession> {
    const session = await this.findOneSession(id, hostId);
    if (!session) throw new NotFoundException('Reading session not found');

    await this.readingSessionRepo.update(id, dto);
    return this.findOneSession(id, hostId);
  }

  async deleteSession(id: string, hostId: number): Promise<void> {
    const session = await this.findOneSession(id, hostId);
    if (!session) throw new NotFoundException('Reading session not found');
    await this.readingSessionRepo.delete(id);
  }

  async addParticipants(
    dto: CreateReadingSessionParticipantsDto,
    hostId: number,
  ): Promise<ReadingSessionParticipant[]> {
    const session = await this.findOneSession(dto.readingSessionId, hostId);
    if (!session) throw new NotFoundException('Reading session not found');
    const participants = dto.participantIds.map((participantId) =>
      this.participantRepo.create({
        participantId,
        readingSessionId: dto.readingSessionId,
      }),
    );
    return await this.participantRepo.save(participants);
  }

  async findAllParticipants(
    readingSessionId: string,
    hostId: number,
  ): Promise<ReadingSessionParticipant[]> {
    const session = await this.findOneSession(readingSessionId, hostId);
    if (!session) throw new NotFoundException('Reading session not found');
    return session.participants;
  }
}
