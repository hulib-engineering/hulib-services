import {
  Column,
  AfterLoad,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { RoleEntity } from '@roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from '@statuses/infrastructure/persistence/relational/entities/status.entity';
import { FileEntity } from '@files/infrastructure/persistence/relational/entities/file.entity';

import { AuthProvidersEnum } from '@auth/auth-providers.enum';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';

import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GenderEntity } from '@genders/infrastructure/persistence/relational/entities/gender.entity';
import { TopicsEntity } from '@topics/infrastructure/persistence/relational/entities/topics.entity';
import { IsPhoneNumber } from 'class-validator';
import {
  MessageEntity,
  ReadingSessionEntity,
} from '@reading-sessions/infrastructure/persistence/relational/entities';
import { TimeSlotEntity } from '@time-slots/infrastructure/persistence/relational/entities/tims-slot.entity';
import { ChatEntity } from '../../../../../chats/infrastructure/persistence/relational/entities/chat.entity';

@Entity({
  name: 'user',
})
export class UserEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  // For "string | null" we need to use String type.
  // More info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, unique: true, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  public previousPassword?: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Column({ default: AuthProvidersEnum.email })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Index()
  @Column({ type: String, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  @Index()
  @Column({ type: String, nullable: true })
  fullName: string | null;

  @ApiProperty({
    type: String,
  })
  @Column({ type: String, nullable: true })
  approval: string | null;

  @ApiProperty({
    type: () => GenderEntity,
  })
  @ManyToOne(() => GenderEntity, {
    eager: true,
  })
  gender?: GenderEntity;

  @ApiProperty({
    type: String,
    example: '1970-01-01',
  })
  @Column({ type: String, nullable: true })
  birthday?: string | null;

  @ApiProperty({
    type: () => FileEntity,
  })
  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  photo?: FileEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
  })
  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null;

  @ApiProperty({
    type: () => StatusEntity,
  })
  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @ApiProperty({
    type: String,
  })
  @Column({ type: String, nullable: true })
  address?: string | null;

  @ApiProperty({
    type: String,
    example: '11234567890',
  })
  @Column({ type: String, nullable: true })
  @IsPhoneNumber()
  parentPhoneNumber?: string | null;

  @ApiProperty({
    type: String,
    example: '11234567891',
  })
  @Column({ type: String, nullable: true })
  @IsPhoneNumber()
  phoneNumber?: string | null;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  bio?: string | null;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  videoUrl?: string | null;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  education?: string | null;

  @ApiProperty()
  @Column({ type: Date, nullable: true })
  educationStart?: Date | null;

  @ApiProperty()
  @Column({ type: Date, nullable: true })
  educationEnd?: Date | null;

  @ManyToMany(() => TopicsEntity)
  @JoinTable({
    name: 'humanBookTopic',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'topicId',
      referencedColumnName: 'id',
    },
  })
  topics?: TopicsEntity[];

  @ApiProperty()
  @Expose()
  get countTopics(): number {
    return this.topics?.length || 0;
  }
  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @OneToMany(
    () => ReadingSessionEntity,
    (readingSession) => readingSession.humanBook,
  )
  readingSessionsAsHumanBook: ReadingSessionEntity[];

  @OneToMany(
    () => ReadingSessionEntity,
    (readingSession) => readingSession.reader,
  )
  readingSessionsAsReader: ReadingSessionEntity[];

  @OneToMany(() => MessageEntity, (message) => message.humanBook)
  messagesAsHumanBook: MessageEntity[];

  @OneToMany(() => MessageEntity, (message) => message.reader)
  messagesAsReader: MessageEntity[];

  @OneToMany(() => TimeSlotEntity, (timeSlot) => timeSlot.huber)
  timeSlots: TimeSlotEntity[];

  @OneToMany(() => ChatEntity, (chat) => chat.sender)
  chatsAsSender: ChatEntity[];

  @OneToMany(() => ChatEntity, (chat) => chat.recipient)
  chatsAsRecipient: ChatEntity[];
}
