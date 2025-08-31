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

import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { FeedbackEntity } from './feedback.entity';
import { MessageEntity } from './message.entity';
import { ReadingSessionStatus } from '../../../../domain';

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

  @Column({ type: 'varchar', length: 4000, nullable: true })
  note?: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  rejectReason?: string;

  @Column({ type: 'varchar', length: 255 })
  sessionUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recordingUrl?: string;

  @Column({
    type: 'enum',
    enum: ReadingSessionStatus,
    default: ReadingSessionStatus.PENDING,
  })
  sessionStatus: ReadingSessionStatus;

  @Column({ type: 'varchar', length: 255 })
  startTime: string;

  @Column({ type: 'varchar', length: 255 })
  endTime: string;

  @CreateDateColumn({ type: 'timestamp' })
  startedAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  endedAt: Date;

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
