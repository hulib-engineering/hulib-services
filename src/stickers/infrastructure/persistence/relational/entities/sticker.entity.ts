import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { FileEntity } from '@files/infrastructure/persistence/relational/entities/file.entity';

@Entity({
  name: 'sticker',
})
export class StickerEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'slapping',
  })
  @Column({ type: String, unique: true })
  name: string;

  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  image?: FileEntity | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
