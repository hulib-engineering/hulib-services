import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiTags('Mail preview')
@Controller('mail/preview')
export class MailPreviewController {
  constructor(private readonly mailService: MailService) {}

  @Get('upload-story-liber')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  @ApiProduces('text/html')
  @ApiOperation({ summary: 'Preview the monthly Liber email without sending it' })
  previewUploadStoryLiber(@Query('name') name?: string): Promise<string> {
    const fullName = typeof name === 'string' ? name.trim().slice(0, 80) : '';
    return this.mailService.previewUploadStoryReminderEmailLiber(fullName || 'Hoa');
  }
}
