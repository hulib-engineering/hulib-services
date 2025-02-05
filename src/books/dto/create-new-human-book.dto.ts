import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TagEntity } from '@tags/infrastructure/persistence/relational/entities/tag.entity';
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
    type: () => TagEntity,
    nullable: true,
  })
  tag: Tag[];
}
