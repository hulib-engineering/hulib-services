import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import {
  ReadingSession,
  ReadingSessionStatus,
} from '../../../../reading-sessions/entities/reading-session.entity';
import { Feedback } from '../../../../reading-sessions/entities/feedback.entity';
import { Message } from '../../../../reading-sessions/entities/message.entity';
import { User } from '../../../../users/domain/user';
import { SchedulesEntity } from '../../../../schedules/infrastructure/persistence/relational/entities/schedules.entity';
import { Story } from '../../../../stories/domain/story';

@Injectable()
export class ReadingSessionSeedService {
  constructor(
    @InjectRepository(ReadingSession)
    private readonly readingSessionRepository: Repository<ReadingSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectRepository(SchedulesEntity)
    private readonly scheduleRepository: Repository<SchedulesEntity>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async run() {
    console.log('🌱 Seeding Reading Sessions...');

    // Get existing data for relationships
    const users = await this.userRepository.find();
    const stories = await this.storyRepository.find();
    const schedules = await this.scheduleRepository.find();

    const sessions: ReadingSession[] = [];

    // Create reading sessions
    for (let i = 0; i < 20; i++) {
      const session = new ReadingSession();

      const humanBook = faker.helpers.arrayElement(users);
      const reader = faker.helpers.arrayElement(
        users.filter((u) => u.id !== humanBook.id),
      );
      const story = faker.helpers.arrayElement(stories);
      const schedule = faker.helpers.arrayElement(schedules);

      session.humanBookId = Number(humanBook.id);
      session.readerId = Number(reader.id);
      session.storyId = story.id;
      session.authorScheduleId = schedule.id;
      session.sessionUrl = faker.internet.url();
      session.note = faker.lorem.paragraph();
      session.review = faker.lorem.paragraph();
      session.recordingUrl = faker.internet.url();
      session.sessionStatus = faker.helpers.arrayElement([
        ReadingSessionStatus.FINISHED,
        ReadingSessionStatus.UNINITIALIZED,
        ReadingSessionStatus.CANCELED,
      ]);

      sessions.push(session);
    }

    const savedSessions = await this.readingSessionRepository.save(sessions);
    console.log(`✅ Inserted ${sessions.length} reading sessions`);

    console.log('🌱 Seeding Feedbacks...');
    const feedbacks: Feedback[] = [];

    // Create feedbacks for sessions
    for (const session of savedSessions) {
      const feedback = new Feedback();
      feedback.readingSessionId = session.id;
      feedback.rating = faker.number.float({ min: 1, max: 5 });
      feedback.content = faker.lorem.paragraph();
      feedbacks.push(feedback);
    }

    await this.feedbackRepository.save(feedbacks);
    console.log(`✅ Inserted ${feedbacks.length} feedbacks`);

    console.log('🌱 Seeding Messages...');
    const messages: Message[] = [];

    // Create messages for sessions
    for (const session of savedSessions) {
      for (let i = 0; i < faker.number.int({ min: 1, max: 5 }); i++) {
        const message = new Message();
        message.readingSessionId = session.id;
        message.humanBookId = session.humanBookId;
        message.readerId = session.readerId;
        message.content = faker.lorem.sentence();
        messages.push(message);
      }
    }

    await this.messageRepository.save(messages);
    console.log(`✅ Inserted ${messages.length} messages`);
  }
}
