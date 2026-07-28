import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
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
import { GenerateContestReportDto } from './dto/generate-contest-report.dto';
import { GeneratedContestReportDto } from './dto/generated-contest-report.dto';

const EXCEL_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function encodeRFC5987Value(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function buildAttachmentHeader(filename: string): string {
  const fallbackFilename =
    filename
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w.-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'contest-report.xlsx';

  return `attachment; filename="${fallbackFilename}"; filename*=UTF-8''${encodeRFC5987Value(filename)}`;
}

@ApiTags('Contest Report')
@Controller({
  path: 'contest-report',
  version: '1',
})
export class ContestReportController {
  constructor(private readonly contestReportService: ContestReportService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate Excel report filtered by topic' })
  @ApiBody({ type: GenerateContestReportDto })
  @ApiCreatedResponse({
    type: GeneratedContestReportDto,
  })
  async generate(
    @Body() generateContestReportDto: GenerateContestReportDto,
  ): Promise<GeneratedContestReportDto> {
    const filename = await this.contestReportService.generate(
      generateContestReportDto.topic,
    );
    return { filename };
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download contest report Excel file by filename' })
  @ApiParam({
    name: 'filename',
    type: String,
    example: 'contest-report-2026-07-28-khoanh_khac.xlsx',
  })
  @ApiOkResponse({ description: 'Excel file' })
  download(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.contestReportService.getFilePath(filename);
    const stream = createReadStream(filePath);
    res.setHeader('Content-Type', EXCEL_CONTENT_TYPE);
    res.setHeader('Content-Disposition', buildAttachmentHeader(filename));
    stream.pipe(res);
  }

  @Get('download-latest')
  @ApiOperation({ summary: 'Download the latest contest report Excel file' })
  @ApiQuery({
    name: 'topic',
    required: false,
    type: String,
    example: 'khoanh khac',
  })
  @ApiOkResponse({ description: 'Excel file' })
  downloadLatest(@Res() res: Response, @Query('topic') topic?: string) {
    const filename = this.contestReportService.getLatestFilename(topic);
    const filePath = this.contestReportService.getFilePath(filename);
    const stream = createReadStream(filePath);
    res.setHeader('Content-Type', EXCEL_CONTENT_TYPE);
    res.setHeader('Content-Disposition', buildAttachmentHeader(filename));
    stream.pipe(res);
  }
}
