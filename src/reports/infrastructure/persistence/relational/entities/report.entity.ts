import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
