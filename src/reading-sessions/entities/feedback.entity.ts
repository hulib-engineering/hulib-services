import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ReadingSession } from '../../reading-sessions/entities/reading-session.entity';

@Entity({
  name: 'feedback',
})
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ReadingSession, (session) => session.feedbacks)
  @JoinColumn({ name: 'readingSessionId' })
  readingSession: ReadingSession;

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
