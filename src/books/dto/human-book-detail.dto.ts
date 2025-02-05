import { ApiProperty } from '@nestjs/swagger';
import { User } from '@users/domain/user';
import { Tag } from '@tags/domain/tag';

export class HumanBookDetailDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  authorName: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  abstract: string;

  @ApiProperty({ type: () => [Tag], nullable: true })
  tags?: Tag[];

  @ApiProperty({ type: () => User })
  author: User;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
