import {
  Entity,
  // PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { RoleEntity } from '../../../../../infrastructure/persistence/relational/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';
// import { ResourceEntity } from '../../../../../resources/infrastructure/persistence/relational/entities/resource.entity';

@Entity('permissions')
export class PermissionEnity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    type: Number,
  })
  id: number;

  @Column({ length: 50 })
  key: string;

  @Column({ length: 50 })
  type: string;

  @Column()
  permission: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
