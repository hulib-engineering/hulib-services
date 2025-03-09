import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { ReadingSession } from './reading-session.entity';

@Entity({
  name: 'readingSessionParticipant',
})
@Unique(['readingSessionId', 'participantId'])
@Index(['readingSessionId'])
@Index(['participantId'])
export class ReadingSessionParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  readingSessionId: string;

  @Column()
  participantId: number;

  @ManyToOne(() => ReadingSession, (session) => session.participants, {
    onDelete: 'CASCADE',
  })
  readingSession: ReadingSession;

  @CreateDateColumn()
  createdAt: Date;
}
