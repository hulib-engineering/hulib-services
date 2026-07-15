import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { ContestReportService } from './contest-report.service';

@ApiTags('Contest Report')
@Controller({
  path: 'contest-report',
  version: '1',
})
export class ContestReportController {
  constructor(private readonly contestReportService: ContestReportService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate Excel report filtered by topic' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', example: 'Khoảnh khắc', description: 'Topic name prefix to filter stories' },
      },
    },
  })
  @ApiCreatedResponse({
    schema: { example: { filename: 'contest-report-Khoảnh_khắc-2026-07-15.xlsx' } },
  })
  async generate(@Body('topic') topic?: string): Promise<{ filename: string }> {
    const filename = await this.contestReportService.generate(topic);
    return { filename };
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download contest report Excel file by filename' })
  @ApiParam({ name: 'filename', type: String, example: 'contest-report-2026-07-15.xlsx' })
  @ApiOkResponse({ description: 'Excel file' })
  async download(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.contestReportService.getFilePath(filename);
    const stream = createReadStream(filePath);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  }

  @Get('download-latest')
  @ApiOperation({ summary: 'Download the latest contest report Excel file' })
  @ApiQuery({ name: 'topic', required: false, type: String, example: 'Khoảnh khắc' })
  @ApiOkResponse({ description: 'Excel file' })
  async downloadLatest(@Res() res: Response, @Query('topic') topic?: string) {
    const filename = this.contestReportService.getLatestFilename(topic);
    const filePath = this.contestReportService.getFilePath(filename);
    const stream = createReadStream(filePath);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  }
}
