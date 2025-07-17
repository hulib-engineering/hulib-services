import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileDto } from '@files/dto/file.dto';

export class CreateStickerDto {
  // Don't forget to use the class-validator decorators in the DTO properties.
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  image?: FileDto | null;
}
