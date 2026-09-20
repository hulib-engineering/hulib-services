import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { FilesS3PresignedService } from './files.service';
import { FileUploadDto } from './dto/file.dto';
import { FileResponseDto } from './dto/file-response.dto';

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesS3PresignedController {
  constructor(
    private readonly filesS3PresignedService: FilesS3PresignedService,
  ) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
  })
  @Post('upload')
  async uploadFile(@Body() file: FileUploadDto) {
    return this.filesS3PresignedService.create(file);
  }
}
