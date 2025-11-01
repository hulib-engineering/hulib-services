import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { ModerationEntity } from '@moderations/infrastructure/persistence/relational/entities/moderation.entity';

@Entity({
  name: 'report',
})
export class ReportEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: String })
  reason: string;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  customReason?: string | null;

  @ApiProperty()
  @Column({ type: Boolean, default: false })
  markAsResolved: boolean;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  rejectedReason?: string | null;

  @ApiProperty()
  @Column({ type: String, nullable: true })
  rejectedCustomReason?: string | null;

  @ApiProperty({
    type: Number,
  })
  @Index()
  @Column({ type: Number })
  reporterId: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, (user) => user.reportsGiven, {
    eager: false,
  })
  @JoinColumn({ name: 'reporterId' })
  reporter?: UserEntity;

  @ApiProperty({
    type: Number,
  })
  @Index()
  @Column({ type: Number })
  reportedUserId: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  @ManyToOne(() => UserEntity, (user) => user.reportsReceived, {
    eager: false,
  })
  @JoinColumn({ name: 'reportedUserId' })
  reportedUser?: UserEntity;

  @ApiProperty({
    type: () => ModerationEntity,
    isArray: true,
  })
  @OneToMany(() => ModerationEntity, (moderation) => moderation.report)
  moderations?: ModerationEntity[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  // @ApiProperty()
  // @UpdateDateColumn()
  // updatedAt: Date;
}
