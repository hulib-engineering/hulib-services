import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ReadingSessionEntity } from './reading-session.entity';

@Entity({
  name: 'feedback',
})
export class FeedbackEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReadingSessionEntity, (session) => session.feedbacks)
  @JoinColumn({ name: 'readingSessionId' })
  readingSession: ReadingSessionEntity;

  @Column()
  readingSessionId: number;

  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  content?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
