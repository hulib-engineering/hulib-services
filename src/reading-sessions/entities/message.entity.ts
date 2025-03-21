import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { ReadingSession } from './reading-session.entity';

@Entity({ name: 'message' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  readingSessionId: number;

  @ManyToOne(() => ReadingSession, (session) => session.messages)
  @JoinColumn({ name: 'readingSessionId' })
  readingSession: ReadingSession;

  @Column()
  humanBookId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'humanBookId' })
  humanBook: UserEntity;

  @Column()
  readerId: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'readerId' })
  reader: UserEntity;

  @Column({ type: 'varchar', length: 4000 })
  content: string;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
