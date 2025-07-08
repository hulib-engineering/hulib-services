import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { StoryEntity } from '@stories/infrastructure/persistence/relational/entities/story.entity';
import { Exclude } from 'class-transformer';

@Entity({
  name: 'topics',
})
export class TopicsEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  name: string;

  @ApiProperty()
  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  updatedAt: Date;

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'humanBookTopic',
    joinColumn: {
      name: 'topicId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  users: UserEntity[];

  @ManyToMany(() => StoryEntity)
  @JoinTable({
    name: 'storyTopic',
    joinColumn: {
      name: 'storyId',
    },
    inverseJoinColumn: {
      name: 'topicId',
    },
  })
  stories?: StoryEntity[];
}
