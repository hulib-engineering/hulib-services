import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { TagEntity } from '@tags/infrastructure/persistence/relational/entities/tag.entity';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';

@Entity({ name: 'books' })
export class BookEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ApiProperty({
    type: String,
  })
  @Column({ type: 'text' })
  abstract?: string;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  author: UserEntity;

  @ApiProperty({
    type: () => TagEntity,
    nullable: true,
  })
  @ManyToMany(() => TagEntity, (tag) => tag.books)
  tag?: TagEntity[];

  @ApiProperty({})
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({})
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;
}
