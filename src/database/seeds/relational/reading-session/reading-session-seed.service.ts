import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

// Domain Models
import {
  ReadingSession,
  ReadingSessionStatus,
} from '@reading-sessions/domain/reading-session';
import { Feedback } from '@reading-sessions/domain/feedback';
import { Message } from '@reading-sessions/domain/message';

// Entities
import { ReadingSessionEntity } from '@reading-sessions/infrastructure/persistence/relational/entities/reading-session.entity';
import { FeedbackEntity } from '@reading-sessions/infrastructure/persistence/relational/entities/feedback.entity';
import { MessageEntity } from '@reading-sessions/infrastructure/persistence/relational/entities/message.entity';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { SchedulesEntity } from '@schedules/infrastructure/persistence/relational/entities/schedules.entity';

// Mappers
import { ReadingSessionMapper } from '@reading-sessions/infrastructure/persistence/relational/mappers/reading-sessions.mapper';
import { FeedbackMapper } from '@reading-sessions/infrastructure/persistence/relational/mappers/feedbacks.mapper';
import { MessageMapper } from '@reading-sessions/infrastructure/persistence/relational/mappers/messages.mapper';

// Mappers
@Injectable()
export class ReadingSessionSeedService {
  constructor(
    @InjectRepository(ReadingSessionEntity)
    private readonly readingSessionRepository: Repository<ReadingSessionEntity>,
    @InjectRepository(FeedbackEntity)
    private readonly feedbackRepository: Repository<FeedbackEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StoryEntity)
    private readonly storyRepository: Repository<StoryEntity>,
    @InjectRepository(SchedulesEntity)
    private readonly scheduleRepository: Repository<SchedulesEntity>,
  ) {}

  async run() {
    console.log('🌱 Seeding Reading Sessions...');

    // Get existing data for relationships
    const users = await this.userRepository.find();
    const stories = await this.storyRepository.find();
    const schedules = await this.scheduleRepository.find();

    if (!users.length || !stories.length || !schedules.length) {
      console.log(
        '❌ Required seed data missing. Please seed users, stories, and schedules first.',
      );
      return;
    }

    // Create reading sessions
    const sessions: ReadingSession[] = [];
    for (let i = 0; i < 20; i++) {
      const humanBook = faker.helpers.arrayElement(users);
      const reader = faker.helpers.arrayElement(
        users.filter((u) => u.id !== humanBook.id),
      );
      const story = faker.helpers.arrayElement(stories);
      const schedule = faker.helpers.arrayElement(schedules);

      const session = new ReadingSession();
      session.humanBookId = Number(humanBook.id);
      session.readerId = Number(reader.id);
      session.storyId = Number(story.id);
      session.authorScheduleId = Number(schedule.id);
      session.sessionUrl = faker.internet.url();
      session.note = faker.lorem.paragraph();
      session.review = faker.lorem.paragraph();
      session.recordingUrl = faker.internet.url();
      session.sessionStatus = faker.helpers.arrayElement(
        Object.values(ReadingSessionStatus),
      );
      session.createdAt = faker.date.past();
      session.updatedAt = faker.date.recent();

      sessions.push(session);
    }

    const savedSessions = await this.readingSessionRepository.save(
      sessions.map((session) => ReadingSessionMapper.toPersistence(session)),
    );

    console.log(`✅ Created ${savedSessions.length} reading sessions`);

    // Create feedbacks
    console.log('🌱 Seeding Feedbacks...');
    const feedbacks: Feedback[] = [];

    for (const session of savedSessions) {
      const feedback = new Feedback();
      feedback.readingSessionId = session.id;
      feedback.rating = faker.number.float({ min: 1, max: 5 });
      feedback.content = faker.lorem.paragraph();
      feedback.createdAt = faker.date.past();
      feedback.updatedAt = faker.date.recent();

      feedbacks.push(feedback);
    }

    await this.feedbackRepository.save(
      feedbacks.map((feedback) => FeedbackMapper.toPersistence(feedback)),
    );

    console.log(`✅ Created ${feedbacks.length} feedbacks`);

    // Create messages
    console.log('🌱 Seeding Messages...');
    const messages: Message[] = [];

    for (const session of savedSessions) {
      const messageCount = faker.number.int({ min: 3, max: 10 });

      for (let i = 0; i < messageCount; i++) {
        const message = new Message();
        message.readingSessionId = session.id;
        message.humanBookId = session.humanBookId;
        message.readerId = session.readerId;
        message.content = faker.lorem.sentence();
        message.createdAt = faker.date.past();
        message.updatedAt = faker.date.recent();

        messages.push(message);
      }
    }

    await this.messageRepository.save(
      messages.map((message) => MessageMapper.toPersistence(message)),
    );

    console.log(`✅ Created ${messages.length} messages`);
  }
}
