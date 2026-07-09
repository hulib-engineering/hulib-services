import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({ example: 'image.jpg' })
  @Allow()
  fileName: string;

  @ApiProperty({ example: 138723 })
  @Allow()
  fileSize: number;
}
