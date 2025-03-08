import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReadingSession,
  ReadingSessionStatus,
} from '@reading-sessions/entities/reading-session.entity';
import { ReadingSessionParticipant } from '@reading-sessions/entities/reading-session-participant.entity';
import { faker } from '@faker-js/faker';

@Injectable()
export class ReadingSessionSeedService {
  constructor(
    @InjectRepository(ReadingSession)
    private readonly readingSessionRepository: Repository<ReadingSession>,

    @InjectRepository(ReadingSessionParticipant)
    private readonly readingSessionParticipantRepository: Repository<ReadingSessionParticipant>,
  ) {}

  async run() {
    console.log('🌱 Seeding Reading Sessions...');
    const sessions: ReadingSession[] = [];
    for (let i = 0; i < 10; i++) {
      const session = new ReadingSession();
      session.title = faker.lorem.words(3);
      session.description = faker.lorem.sentence();
      session.sessionStatus = faker.helpers.arrayElement([
        ReadingSessionStatus.CONFIRMED,
        ReadingSessionStatus.CANCELLED,
        ReadingSessionStatus.PENDING,
      ]);
      session.startTime = faker.date.future();
      session.endTime = faker.date.future();
      session.hostId = faker.number.int({ min: 1, max: 10 });

      sessions.push(session);
    }

    await this.readingSessionRepository.save(sessions);
    console.log(`✅ Inserted ${sessions.length} reading sessions`);

    console.log('🌱 Seeding Reading Session Participants...');
    const participants: ReadingSessionParticipant[] = [];

    for (const session of sessions) {
      const numParticipants = faker.number.int({ min: 2, max: 5 });

      for (let j = 0; j < numParticipants; j++) {
        const participant = new ReadingSessionParticipant();
        participant.readingSession = session;
        participant.participantId = faker.number.int({ min: 1, max: 2000 });

        participants.push(participant);
      }
    }

    if (participants.length > 0) {
      await this.readingSessionParticipantRepository.save(participants);
      console.log(
        `✅ Inserted ${participants.length} reading session participants`,
      );
    } else {
      console.log('⚠️ No participants were inserted');
    }
  }
}
