import { Tag } from '@tags/domain/tag';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from '@users/domain/user';

export class Book {
  @ApiProperty({
    type: Number,
  })
  id: number | string;

  @ApiProperty({
    type: User,
  })
  @IsNotEmpty()
  author: User;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  abstract: string;

  @ApiProperty({
    type: () => Tag,
  })
  @IsOptional()
  tag: Tag[] | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
