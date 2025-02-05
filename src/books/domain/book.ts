import { Tag } from '@tags/domain/tag';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';

export class Book {
  @ApiProperty({
    type: Number,
  })
  id: number | string;

  @ApiProperty({
    type: UserEntity,
  })
  @IsNotEmpty()
  author: UserEntity;

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
