import {
  Entity,
  // PrimaryColumn,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { RoleEntity } from '../../infrastructure/persistence/relational/entities/role.entity';
// import { ApiProperty } from '@nestjs/swagger';

@Entity('permissions')
export class PermissionEnity {
  // @ApiProperty({
  //   type: Number,
  // })
  // @PrimaryColumn()
  @PrimaryGeneratedColumn()
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
