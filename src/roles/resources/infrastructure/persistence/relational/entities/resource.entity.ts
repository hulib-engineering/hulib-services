import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionEnity } from '../../../../../permissions/infrastructure/persistence/relational/entities/permissions.entity';

@Entity('resource')
export class ResourceEntity {
  @PrimaryGeneratedColumn('uuid')
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

  @OneToMany(() => PermissionEnity, (permission) => permission.id)
  permissions: PermissionEnity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
