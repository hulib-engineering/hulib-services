import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';

@Entity({
  name: 'timeSlot',
})
export class TimeSlotEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  @Column({ type: Number })
  dayOfWeek: number;

  @ApiProperty({
    type: Number,
  })
  @Column({ type: Number })
  huberId: number;

  @ManyToOne(() => UserEntity, (user) => user.timeSlots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'huberId' })
  huber: UserEntity;

  @ApiProperty({
    type: String,
    example: '06:00',
  })
  @Column({ type: String })
  startTime: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
