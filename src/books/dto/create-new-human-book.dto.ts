import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tag } from '@tags/domain/tag';
import { IsNumber } from 'class-validator';

export class createNewHumanBookDto {
  @ApiProperty({
    type: String,
  })
  title: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  abstract?: string;

  @ApiProperty()
  @IsNumber()
  authorId: number;

  @ApiPropertyOptional({
    type: () => Tag,
    nullable: true,
  })
  tag: Tag[];
}
