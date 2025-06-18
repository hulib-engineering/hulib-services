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
import { ChatService } from './chat.service';
import { CreateChatsDto } from './dto/create-chat.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Chat } from './domain/chat';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Chat')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'chat',
  version: '1',
})
export class TimeSlotController {
  constructor(private readonly timeSlotService: ChatService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new time slot' })
  @ApiCreatedResponse({
    type: Chat,
  })
  create(
    @Body() createTimeSlotsDto: CreateChatsDto,
    @Request() request: any,
  ) {
    return this.timeSlotService.createMany(createTimeSlotsDto, request.user.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all time slots' })
  @ApiOkResponse({
    type: Chat,
    isArray: true,
  })
  async findAll(@Request() request: any): Promise<Chat[]> {
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
    type: Chat,
    isArray: true,
  })
  async findByHuber(@Param('id') id: User['id']): Promise<Chat[]> {
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
    type: Chat,
  })
  findOne(@Param('id') id: Chat['id']) {
    return this.timeSlotService.findOne(id);
  }

  // @Put(':id')
  // @ApiOperation({ summary: 'Update a specific time slot' })
  // @ApiParam({
  //   name: 'id',
  //   type: Number,
  //   required: true,
  // })
  // @ApiCreatedResponse({
  //   type: TimeSlot,
  // })
  // update(
  //   @Param('id') id: TimeSlot['id'],
  //   @Body() updateTimeSlotDto: CreateTimeSlotDto,
  // ) {
  //   return this.timeSlotService.update(id, updateTimeSlotDto);
  // }

  // @Get('day-of-week/:dayOfWeek')
  // @ApiOperation({ summary: 'Get time slots by day of week' })
  // @ApiParam({
  //   name: 'dayOfWeek',
  //   type: Number,
  //   required: true,
  // })
  // @ApiOkResponse({
  //   type: TimeSlot,
  //   isArray: true,
  // })
  // findByDayOfWeek(@Param('dayOfWeek') dayOfWeek: TimeSlot['dayOfWeek']) {
  //   return this.timeSlotService.findByDayOfWeek(dayOfWeek);
  // }
}
