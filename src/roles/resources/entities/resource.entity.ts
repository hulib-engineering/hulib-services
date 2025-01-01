import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionEnity } from '../../permissions/entities/permissions.entity';

@Entity('resource')
export class ResourceEntity {
  @ManyToOne(() => PermissionEnity, (permission) => permission.id)
  @ApiProperty({
    type: Number,
  })
  @PrimaryColumn()
  id: number;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50, nullable: false })
  name: string;

  @Column({ length: 50, nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
