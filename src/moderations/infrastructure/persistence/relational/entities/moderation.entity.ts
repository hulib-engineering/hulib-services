import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { ReportEntity } from '@reports/infrastructure/persistence/relational/entities/report.entity';
import { 
  ModerationActionType,
  ModerationStatus 
} from '@moderations/domain/moderation';

@Entity({
  name: 'moderation',
})
export class ModerationEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    enum: ModerationActionType,
  })
  @Column({
    type: 'enum',
    enum: ModerationActionType,
  })
  actionType: ModerationActionType;

  @ApiProperty({
    enum: ModerationStatus,
  })
  @Column({
    type: 'enum',
    enum: ModerationStatus,
    default: ModerationStatus.active,
  })
  status: ModerationStatus;

  @ApiProperty({
    type: Number,
  })
  @Column({ type: Number })
  userId: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @ApiProperty({
    type: Number,
    nullable: true,
  })
  @Column({ type: Number, nullable: true })
  reportId?: number | null;

  @ApiProperty({
    type: () => ReportEntity,
    nullable: true,
  })
  @ManyToOne(() => ReportEntity, {
    eager: false,
  })
  @JoinColumn({ name: 'reportId' })
  report?: ReportEntity | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
