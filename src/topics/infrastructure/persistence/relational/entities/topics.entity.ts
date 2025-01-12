import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { HumanBooksEntity } from '../../../../../human-books/infrastructure/persistence/relational/entities/human-books.entity';

@Entity({
  name: 'topics',
})
export class TopicsEntity extends EntityRelationalHelper {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => HumanBooksEntity)
  @JoinTable({
    name: 'humanBook_sharing_topic',
  })
  humanBooks: HumanBooksEntity[];
}
