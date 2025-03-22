import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { SchedulesEntity } from '@schedules/infrastructure/persistence/relational/entities/schedules.entity';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { FeedbackEntity } from './feedback.entity';
import { MessageEntity } from './message.entity';

export enum ReadingSessionStatus {
  FINISHED = 'finished',
  UNINITIALIZED = 'unInitialized',
  CANCELED = 'canceled',
}

@Entity({
  name: 'readingSession',
})
@Index('idx_session_status', ['sessionStatus'])
export class ReadingSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.readingSessionsAsHumanBook, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'humanBookId' })
  humanBook: UserEntity;

  @Column()
  humanBookId: number;

  @ManyToOne(() => UserEntity, (user) => user.readingSessionsAsReader, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'readerId' })
  reader: UserEntity;

  @Column()
  readerId: number;

  @ManyToOne(() => StoryEntity, (story) => story.readingSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'storyId' })
  story: StoryEntity;

  @Column()
  storyId: number;

  @ManyToOne(() => SchedulesEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorScheduleId' })
  authorSchedule: SchedulesEntity;

  @Column()
  authorScheduleId: number;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  note?: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  review?: string;

  @Column({ type: 'varchar', length: 255 })
  sessionUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recordingUrl?: string;

  @Column({
    type: 'enum',
    enum: ReadingSessionStatus,
    default: ReadingSessionStatus.UNINITIALIZED,
  })
  sessionStatus: ReadingSessionStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => FeedbackEntity, (feedback) => feedback.readingSession)
  feedbacks: FeedbackEntity[];

  @OneToMany(() => MessageEntity, (message) => message.readingSession)
  messages: MessageEntity[];
}
