import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '../../../../../stories/infrastructure/persistence/relational/entities/story.entity';

export enum NotifType {
  SESSION_REQUEST = 'sessionRequest',
  ACCOUNT = 'account',
  CONTENT_MODERATION = 'contentModeration',
  OTHER = 'other',
}
@Entity({
  name: 'notification',
})
export class notificationEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  recipientId: number;

  @ManyToOne(() => UserEntity, (user) => user.notificationsReceived)
  @JoinColumn({ name: 'recipientId' })
  recipient: UserEntity;

  @ApiProperty()
  @Column()
  senderId: number;

  @ManyToOne(() => UserEntity, (user) => user.notificationsSent)
  @JoinColumn({ name: 'senderId' })
  sender: UserEntity;

  @ApiProperty({ enum: NotifType })
  @Column({
    type: 'enum',
    enum: NotifType,
    default: NotifType.SESSION_REQUEST,
  })
  type: NotifType;

  @ApiProperty()
  @Column({ default: false })
  seen: boolean;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  relatedEntityId?: number;

  @ManyToOne(() => StoryEntity, (story) => story.notifications)
  @JoinColumn({ name: 'relatedEntityId' })
  relatedEntity?: StoryEntity;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
