import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Report } from './domain/report';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'reports',
  version: '1',
})
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Report,
  })
  create(@Body() createReportDto: CreateReportDto, @Request() request) {
    const reporterId = request.user.id;

    return this.reportsService.create(reporterId, createReportDto);
  }
}
