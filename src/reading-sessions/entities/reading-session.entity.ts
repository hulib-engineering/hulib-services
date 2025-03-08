import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ReadingSessionParticipant } from './reading-session-participant.entity';

export enum ReadingSessionStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

@Entity()
@Index('idx_session_status', ['sessionStatus'])
@Index('idx_session_host_status_time', ['hostId', 'sessionStatus', 'startTime'])
export class ReadingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReadingSessionStatus,
    default: ReadingSessionStatus.PENDING,
  })
  sessionStatus: ReadingSessionStatus;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column()
  @Index()
  hostId: number;

  @OneToMany(
    () => ReadingSessionParticipant,
    (participant) => participant.readingSession,
    { cascade: true },
  )
  participants: ReadingSessionParticipant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
