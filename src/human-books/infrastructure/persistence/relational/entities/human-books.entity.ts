import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { TopicsEntity } from '../../../../../topics/infrastructure/persistence/relational/entities/topics.entity';

@Entity({
  name: 'humanBooks',
})
export class HumanBooksEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  @OneToOne(() => UserEntity, {
    eager: true,
  })
  @JoinColumn()
  user: UserEntity;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  bio: string | null;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  videoUrl: string | null;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  education: string | null;

  @ApiProperty()
  @Column({ type: Date, nullable: true })
  educationStart: Date | null;

  @ApiProperty()
  @Column({ type: Date, nullable: true })
  educationEnd: Date | null;

  @ManyToMany(() => TopicsEntity)
  @JoinTable({
    name: 'humanBook_sharing_topic',
  })
  topics: TopicsEntity[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
