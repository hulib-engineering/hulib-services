import { Controller, Get } from '@nestjs/common';
import { ScheduleService } from './schedules.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Schedules')
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }
}
