import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { ChatStatus } from '../../../../domain/chat';

@Entity({
  name: 'chat',
})
export class ChatEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: Number })
  senderId: number;

  @ManyToOne(() => UserEntity, (user) => user.chatsAsSender, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;

  @Column({ type: Number })
  recipientId: number;

  @ManyToOne(() => UserEntity, (user) => user.chatsAsRecipient, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipientId' })
  recipient: UserEntity;

  @Column({ type: String })
  message: string;

  @Column({
    enum: ChatStatus,
    type: 'enum',
    default: ChatStatus.SENT,
  })
  status: ChatStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
