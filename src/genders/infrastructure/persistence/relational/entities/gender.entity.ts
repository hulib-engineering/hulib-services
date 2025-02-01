import { Column, Entity, PrimaryColumn } from 'typeorm';

import { EntityRelationalHelper } from '@utils/relational-entity-helper';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'gender',
})
export class GenderEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'other',
  })
  @Column()
  name?: string;
}
