import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';
import { BookEntity } from '@books/infrastructure/persistence/relational/entities/book.entity';

@Entity({
  name: 'tag',
})
export class TagEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryColumn()
  id: number;

  @ManyToMany(() => BookEntity, (book) => book.tag)
  books?: TagEntity[];

  @ApiProperty({
    type: String,
  })
  @Column()
  content?: string;
}
