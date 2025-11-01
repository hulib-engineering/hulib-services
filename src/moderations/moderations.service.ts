import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ModerationRepository } from './infrastructure/persistence/moderation.repository';
import { UsersService } from '@users/users.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';
import { Moderation, ModerationActionType } from './domain/moderation';
import { StatusEnum } from '@statuses/statuses.enum';

@Injectable()
export class ModerationsService {
  constructor(
    private readonly moderationRepository: ModerationRepository,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Ban a user
   * - Validates reportId if provided
   * - Sets user status to inactive
   * - Creates moderation record (ban)
   * - Links to report if reportId provided
   */
  async banUser(dto: BanUserDto): Promise<Moderation> {
    // Validate user exists
    const user = await this.usersService.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if already banned
    if (user.status?.id === StatusEnum.inactive) {
      throw new ConflictException('User is already banned');
    }

    // Validate reportId if provided
    if (dto.reportId) {
      const report = await this.moderationRepository.findReportById(dto.reportId);
      if (!report) {
        throw new NotFoundException('Report not found');
      }

      // Validate report is for the correct user
      if (report.reportedUserId !== dto.userId) {
        throw new BadRequestException(
          'Report does not belong to the specified user',
        );
      }
    }

    // Update user status to inactive
    await this.usersService.update(dto.userId, {
      status: { id: StatusEnum.inactive },
    });

    // Create moderation record
    const moderation = await this.moderationRepository.createModeration({
      userId: dto.userId,
      actionType: ModerationActionType.ban,
      reportId: dto.reportId,
    });

    return moderation;
  }

  /**
   * Unban a user
   * - Validates reportId if provided
   * - Resets warn count to 0
   * - Sets user status to active
   * - Reverses the active ban moderation
   * - Creates moderation record (unban)
   */
  async unbanUser(dto: UnbanUserDto): Promise<Moderation> {
    // Validate user exists
    const user = await this.usersService.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is actually banned
    if (user.status?.id !== StatusEnum.inactive) {
      throw new BadRequestException('User is not banned');
    }

    // Validate reportId if provided
    if (dto.reportId) {
      const report = await this.moderationRepository.findReportById(dto.reportId);
      if (!report) {
        throw new NotFoundException('Report not found');
      }

      // Validate report is for the correct user
      if (report.reportedUserId !== dto.userId) {
        throw new BadRequestException(
          'Report does not belong to the specified user',
        );
      }
    }

    // Find active ban moderation
    const activeBan = await this.moderationRepository.findActiveBanByUserId(
      dto.userId,
    );

    // Reset warn count
    await this.usersService.update(dto.userId, {
      warnCount: 0,
    });

    // Set status to active
    await this.usersService.update(dto.userId, {
      status: { id: StatusEnum.active },
    });

    // Reverse the active ban if found
    if (activeBan) {
      await this.moderationRepository.reverseModerationById(activeBan.id);
    }

    // Create unban moderation record
    const moderation = await this.moderationRepository.createModeration({
      userId: dto.userId,
      actionType: ModerationActionType.unban,
      reportId: dto.reportId,
    });

    return moderation;
  }
}