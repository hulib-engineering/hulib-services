import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { TimeSlotService } from './time-slots.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TimeSlot } from './domain/time-slot';

@ApiTags('time-slots')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'time-slots',
  version: '1',
})
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @Post()
  @ApiCreatedResponse({
    type: TimeSlot,
  })
  create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotService.create(createTimeSlotDto);
  }

  @Get()
  @ApiOkResponse({
    type: TimeSlot,
    isArray: true,
  })
  async findAll(): Promise<TimeSlot[]> {
    return this.timeSlotService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: TimeSlot,
  })
  findOne(@Param('id') id: TimeSlot['id']) {
    return this.timeSlotService.findOne(id);
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiCreatedResponse({
    type: TimeSlot,
  })
  update(
    @Param('id') id: TimeSlot['id'],
    @Body() updateTimeSlotDto: CreateTimeSlotDto,
  ) {
    return this.timeSlotService.update(id, updateTimeSlotDto);
  }

  @Get('day-of-week/:dayOfWeek')
  @ApiParam({
    name: 'dayOfWeek',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: TimeSlot,
    isArray: true,
  })
  findByDayOfWeek(@Param('dayOfWeek') dayOfWeek: TimeSlot['dayOfWeek']) {
    return this.timeSlotService.findByDayOfWeek(dayOfWeek);
  }
}
