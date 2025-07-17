import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  // DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { FileEntity } from '@files/infrastructure/persistence/relational/entities/file.entity';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { TopicsEntity } from '@topics/infrastructure/persistence/relational/entities/topics.entity';
import { PublishStatus } from '@stories/status.enum';
import { ReadingSessionEntity } from '@reading-sessions/infrastructure/persistence/relational/entities';

@Entity({
  name: 'story',
})
export class StoryEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'Story title',
  })
  @Column({ type: String, unique: true })
  title: string;

  @ApiProperty({
    type: String,
    example: 'some story abstract',
  })
  @Column({ type: String, nullable: true })
  abstract?: string | null;

  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  cover?: FileEntity | null;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  humanBook?: UserEntity | null;

  @ManyToMany(() => TopicsEntity)
  @JoinTable({
    name: 'storyTopic',
    joinColumn: {
      name: 'storyId',
    },
    inverseJoinColumn: {
      name: 'topicId',
    },
  })
  topics?: TopicsEntity[];

  @ApiProperty({
    type: Number,
    example: PublishStatus.draft,
  })
  @Column({ type: Number, default: PublishStatus.draft })
  publishStatus: PublishStatus;

  // @ApiProperty({
  //   type: Number,
  //   example: 4,
  // })
  // @Column({ type: Number, nullable: true })
  // rating?: number | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // @ApiProperty()
  // @DeleteDateColumn()
  // deletedAt: Date;

  @OneToMany(
    () => ReadingSessionEntity,
    (readingSession) => readingSession.story,
  )
  readingSessions: ReadingSessionEntity[];

  @ApiProperty({
    type: String,
    example: 'Reject reason',
  })
  @Column({ type: String })
  rejectionReason?: string;
}
