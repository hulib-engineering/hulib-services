import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { AppealStatus } from '../../../../domain/appeal';
import { ModerationEntity } from '../../../../../moderations/infrastructure/persistence/relational/entities/moderation.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({
  name: 'appeal',
})
export class AppealEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: Number,
  })
  @Index()
  @Column({ type: Number })
  moderationId: number;

  @ApiProperty({
    type: () => ModerationEntity,
  })
  @ManyToOne(() => ModerationEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'moderationId' })
  moderation?: ModerationEntity;

  @ApiProperty({
    type: Number,
  })
  @Index()
  @Column({ type: Number })
  userId: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @ApiProperty({
    type: String,
  })
  @Column({ type: 'varchar', length: 4000 })
  message: string;

  @ApiProperty({
    enum: AppealStatus,
  })
  @Index()
  @Column({
    type: 'enum',
    enum: AppealStatus,
    default: AppealStatus.pending,
  })
  status: AppealStatus;

  @ApiProperty()
  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    nullable: true,
  })
  @DeleteDateColumn()
  deletedAt: Date | null;
}
