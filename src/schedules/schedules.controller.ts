import { Controller, Get, Param } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedul

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

    // @Post()
    // @ApiCreatedResponse({
    //   type: Story,
    // })
    // create(@Body() saveFavStoryDto: SaveFavStoryDto) {
    //   return saveFavStoryDto;
    // }

  @Get()
  getAllSchedules(): Schedule[] {
    return this.scheduleService.getAllSchedules();
  }

  @Get(':id')
  getScheduleById(@Param('id') id: string): Schedule {
    return this.scheduleService.getScheduleById(id);
  }
}
