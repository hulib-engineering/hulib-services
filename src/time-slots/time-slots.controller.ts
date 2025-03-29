import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { TimeSlotService } from './time-slots.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TimeSlot } from './domain/time-slot';

@ApiTags('Time slots')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'time-slots',
  version: '1',
})
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new time slot' })
  @ApiCreatedResponse({
    type: TimeSlot,
  })
  create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotService.create(createTimeSlotDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all time slots' })
  @ApiOkResponse({
    type: TimeSlot,
    isArray: true,
  })
  async findAll(): Promise<TimeSlot[]> {
    return this.timeSlotService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific time slot' })
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
  @ApiOperation({ summary: 'Update a specific time slot' })
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
  @ApiOperation({ summary: 'Get time slots by day of week' })
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
