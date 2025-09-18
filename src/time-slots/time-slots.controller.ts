import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { User } from '@users/domain/user';
import { TimeSlotService } from './time-slots.service';
import { CreateTimeSlotsDto } from './dto/create-time-slot.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TimeSlot } from './domain/time-slot';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Time slots')
@Controller({
  path: 'time-slots',
  version: '1',
})
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new time slot' })
  @ApiCreatedResponse({
    type: TimeSlot,
  })
  create(@Body() createTimeSlotsDto: CreateTimeSlotsDto, @Request() request) {
    return this.timeSlotService.createMany(createTimeSlotsDto, request.user.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all time slots' })
  @ApiOkResponse({
    type: TimeSlot,
    isArray: true,
  })
  async findAll(@Request() request: any): Promise<TimeSlot[]> {
    return this.timeSlotService.findAll(request.user.id);
  }

  @Get('huber/:id')
  @ApiOperation({ summary: 'Get time slots of a huber' })
  @ApiParam({
    name: 'id',
    type: Number,
    required: true,
  })
  @ApiOkResponse({
    type: TimeSlot,
    isArray: true,
  })
  async findByHuber(@Param('id') id: User['id']): Promise<TimeSlot[]> {
    return this.timeSlotService.findByHuber(id);
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
}
