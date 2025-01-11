import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { TagEntity } from '../../../../../tags/infrastructure/persistence/relational/entities/tag.entity';

@Entity({ name: 'books' })
export class BookEntity {
  @ApiProperty({
    type: Number,
    description: 'Unique identifier for the book',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    description: 'Title of the book',
  })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Abstract or summary of the book',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  abstract?: string;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  author: UserEntity;

  @ApiProperty({
    type: () => TagEntity,
    description: 'Tag associated with the book',
    nullable: true,
  })
  @ManyToOne(() => TagEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tagId' })
  tag?: TagEntity;

  @ApiProperty({
    description: 'Timestamp when the book was created',
    example: '2025-01-01T12:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the book was last updated',
    example: '2025-01-02T12:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Timestamp when the book was soft-deleted',
    example: '2025-01-03T12:00:00Z',
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}
