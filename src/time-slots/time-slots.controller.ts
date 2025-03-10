import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  // Delete,
} from '@nestjs/common';
import { TimeSlotService } from './time-slots.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TimeSlot } from './domain/time-slot';

@ApiTags('Reading Sessions')
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

  // @Delete(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // remove(@Param('id') id: TimeSlot['id']) {
  //   return this.timeSlotService.remove(id);
  // }
}
