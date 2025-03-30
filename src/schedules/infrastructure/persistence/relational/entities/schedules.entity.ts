import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { IsNotEmpty } from 'class-validator';
import { UserDto } from '../../../../../users/dto/user.dto';
import { Type } from 'class-transformer';

@Entity({
  name: 'schedules',
})
export class SchedulesEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: { id: '2' }, type: UserDto })
  @IsNotEmpty()
  @Type(() => UserDto)
  humanBook: UserDto;

  @ApiProperty({ example: { id: '46' }, type: UserDto })
  @IsNotEmpty()
  @Type(() => UserDto)
  userLiber: UserDto;

  @ApiProperty({ type: Date, example: '2024-03-01T09:00:00Z' })
  @Column({ type: 'timestamp', nullable: false })
  startedAt: Date;

  @ApiProperty({ type: String, example: '09:00' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  startTime: string;

  @ApiProperty({ type: Date, example: '2024-03-01T09:30:00Z' })
  @Column({ type: 'timestamp', nullable: false })
  endedAt: Date;

  @ApiProperty({ type: String, example: '09:30' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  endTime: string;

  @ApiProperty({ type: Boolean, example: true })
  @Column({ type: 'boolean', default: false })
  isBooked: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn({
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;
}
