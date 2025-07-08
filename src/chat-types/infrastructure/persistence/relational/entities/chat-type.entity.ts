import { Column, Entity, PrimaryColumn } from 'typeorm';
import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'chatType',
})
export class ChatTypeEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'txt',
  })
  @Column()
  name?: string;
}
