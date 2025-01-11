import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { TagEntity } from '../../tags/infrastructure/persistence/relational/entities/tag.entity';
import { Tag } from '../../tags/domain/tag';

export class createNewHumanBookDto {
  @ApiProperty({
    type: String,
  })
  title: string | null;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  abstract?: string;

  @ApiProperty({
    type: () => UserEntity,
  })
  author: UserEntity;

  @ApiPropertyOptional({
    type: () => TagEntity,
    nullable: true,
  })
  tag: Tag[];
}
