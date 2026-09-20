import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@users/domain/user';

export class FavoriteHuberDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ type: Number })
  huberId: number;

  @ApiPropertyOptional({ type: User })
  huber?: User;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;

  @ApiPropertyOptional({ nullable: true })
  deletedAt?: Date | null;
}
