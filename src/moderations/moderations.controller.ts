import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ModerationsService } from './moderations.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';
import { Moderation } from './domain/moderation';
import { Roles } from '@roles/roles.decorator';
import { RoleEnum } from '@roles/roles.enum';
import { RolesGuard } from '@roles/roles.guard';
import { WarnUserDto } from './dto/warn-user.dto';
import { UnwarnUserDto } from './dto/unwarn-user.dto';

@ApiTags('Moderations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'moderations',
  version: '1',
})
export class ModerationsController {
  constructor(private readonly moderationsService: ModerationsService) {}

  @ApiOperation({
    summary: 'Ban a user (Admin only)',
    description: 'Sets user status to inactive.',
  })
  @ApiOkResponse({
    type: Moderation,
    description: 'User successfully banned',
  })
  @Post('ban')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  banUser(@Body() dto: BanUserDto): Promise<Moderation> {
    return this.moderationsService.banUser(dto);
  }

  @ApiOperation({
    summary: 'Unban a user (Admin only)',
    description: 'Resets warn count to 0 and sets user status to active.',
  })
  @ApiOkResponse({
    type: Moderation,
    description: 'User successfully unbanned',
  })
  @Post('unban')
  @Roles(RoleEnum.admin)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  unbanUser(@Body() dto: UnbanUserDto): Promise<Moderation> {
    return this.moderationsService.unbanUser(dto);
  }

  @ApiOperation({
    summary: 'Warn a user (Admin only)',
    description:
      'Increments user warning count. Auto-bans after 3 warnings.',
  })
  @ApiOkResponse({
    type: Moderation,
    description: 'User successfully warned',
  })
  @Post('warn')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  warnUser(@Body() dto: WarnUserDto): Promise<Moderation> {
    return this.moderationsService.warnUser(dto);
  }

  @ApiOperation({
    summary: 'Remove a warning from a user (Admin only)',
    description:
      'Decrements user warning count and reverses the most recent warning.',
  })
  @ApiOkResponse({
    type: Moderation,
    description: 'Warning successfully removed',
  })
  @Post('unwarn')
  @Roles(RoleEnum.admin)
  @HttpCode(HttpStatus.OK)
  unwarnUser(@Body() dto: UnwarnUserDto): Promise<Moderation> {
    return this.moderationsService.unwarnUser(dto);
  }
}
