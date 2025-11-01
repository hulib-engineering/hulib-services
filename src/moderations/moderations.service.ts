import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ModerationRepository } from './infrastructure/persistence/moderation.repository';
import { UsersService } from '@users/users.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';
import { Moderation, ModerationActionType, ModerationStatus } from './domain/moderation';
import { StatusEnum } from '@statuses/statuses.enum';

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);

  constructor(
    private readonly moderationRepository: ModerationRepository,
    private readonly usersService: UsersService,
  ) {}

  async banUser(dto: BanUserDto): Promise<Moderation> {
    try {
      const user = await this.usersService.findById(dto.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${dto.userId} not found`);
      }

      if (user.status?.id === StatusEnum.inactive) {
        throw new ConflictException(
          `User ${dto.userId} is already banned`,
        );
      }

      if (dto.reportId) {
        const report = await this.moderationRepository.findReportById(
          dto.reportId,
        );

        if (!report) {
          throw new NotFoundException(
            `Report with ID ${dto.reportId} not found`,
          );
        }

        // Validate report belongs to the user being banned
        if (report.reportedUserId !== dto.userId) {
          throw new BadRequestException(
            `Report ${dto.reportId} is not associated with user ${dto.userId}`,
          );
        }

        if (report.markAsResolved) {
          this.logger.warn(
            `Report ${dto.reportId} is already marked as resolved`,
          );
        }
      }

      const existingBan = await this.moderationRepository.find({
        where: {
          userId: dto.userId,
          actionType: ModerationActionType.ban,
          status: ModerationStatus.active,
        },
        take: 1,
      });

      if (existingBan.length > 0) {
        throw new ConflictException(
          `User ${dto.userId} already has an active ban`,
        );
      }

      await this.usersService.update(dto.userId, {
        status: { id: StatusEnum.inactive },
      });

      this.logger.log(`User ${dto.userId} status set to inactive`);

      const moderation = await this.moderationRepository.create({
        userId: dto.userId,
        actionType: ModerationActionType.ban,
        reportId: dto.reportId,
      });

      this.logger.log(
        `Ban moderation ${moderation.id} created for user ${dto.userId}`,
      );

      return moderation;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to ban user ${dto.userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to ban user. Please try again later.',
      );
    }
  }

  async unbanUser(dto: UnbanUserDto): Promise<Moderation> {
    this.logger.log(`Attempting to unban user ${dto.userId}`);

    try {
      const user = await this.usersService.findById(dto.userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${dto.userId} not found`);
      }

      if (user.status?.id !== StatusEnum.inactive) {
        throw new BadRequestException(
          `User ${dto.userId} is not currently banned`,
        );
      }

      if (dto.reportId) {
        const report = await this.moderationRepository.findReportById(
          dto.reportId,
        );

        if (!report) {
          throw new NotFoundException(
            `Report with ID ${dto.reportId} not found`,
          );
        }

        // Validate report belongs to the user being unbanned
        if (report.reportedUserId !== dto.userId) {
          this.logger.warn(
            `Unban failed: Report ${dto.reportId} does not belong to user ${dto.userId}`,
          );
          throw new BadRequestException(
            `Report ${dto.reportId} is not associated with user ${dto.userId}`,
          );
        }
      }

      const activeBans = await this.moderationRepository.find({
        where: {
          userId: dto.userId,
          actionType: ModerationActionType.ban,
          status: ModerationStatus.active,
        },
        order: {
          createdAt: 'DESC',
        },
        take: 1,
      });

      const activeBan = activeBans[0];

      if (activeBan) {
        await this.moderationRepository.update(activeBan.id, {
          status: ModerationStatus.reversed,
        });

        this.logger.log(
          `Ban moderation ${activeBan.id} reversed for user ${dto.userId}`,
        );
      }

      await this.usersService.update(dto.userId, {
        status: { id: StatusEnum.active },
        warnCount: 0,
      });

      this.logger.log(`User ${dto.userId} status set to active`);

      const moderation = await this.moderationRepository.create({
        userId: dto.userId,
        actionType: ModerationActionType.unban,
        reportId: dto.reportId,
      });

      this.logger.log(
        `Unban moderation ${moderation.id} created for user ${dto.userId}`,
      );

      return moderation;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to unban user ${dto.userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to unban user. Please try again later.',
      );
    }
  }
}