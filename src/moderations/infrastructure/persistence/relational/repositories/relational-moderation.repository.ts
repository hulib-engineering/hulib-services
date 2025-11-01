import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { 
  ModerationRepository 
} from '@moderations/infrastructure/persistence/moderation.repository';
import {
  Moderation,
  ModerationActionType,
  ModerationStatus,
} from '@moderations/domain/moderation';
import { ModerationEntity } from '../entities/moderation.entity';
import { ModerationMapper } from '../mappers/moderation.mapper';

import { Report } from '@reports/domain/report';
import { ReportEntity } from '@reports/infrastructure/persistence/relational/entities/report.entity';
import { ReportMapper } from '@reports/infrastructure/persistence/relational/mappers/report.mapper';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';

@Injectable()
export class ModerationRelationalRepository implements ModerationRepository {
  constructor(
    @InjectRepository(ModerationEntity)
    private readonly repository: Repository<ModerationEntity>,
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
  ) {}

  // ============================================
  // Report Operations
  // ============================================

  async findReportById(id: Report['id']): Promise<NullableType<Report>> {
    const entity = await this.reportRepository.findOne({
      where: { id: Number(id) },
      relations: ['reporter', 'reportedUser'],
    });

    return entity ? ReportMapper.toDomain(entity) : null;
  }

  // ============================================
  // Moderation CRUD Operations
  // ============================================

  async create(data: {
    userId: number;
    actionType: ModerationActionType;
    reportId?: number;
  }): Promise<Moderation> {
    const entity = await this.repository.save(
      this.repository.create({
        userId: data.userId,
        actionType: data.actionType,
        reportId: data.reportId,
      }),
    );

    // Load relations after save
    const entityWithRelations = await this.repository.findOne({
      where: { id: entity.id },
      relations: ['user', 'user.status', 'user.role', 'report', 'report.reporter', 'report.reportedUser'],
    });

    return ModerationMapper.toDomain(entityWithRelations!);
  }

  async findById(id: number): Promise<Moderation | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['user', 'user.status', 'user.role', 'report', 'report.reporter', 'report.reportedUser'],
    });
    
    return entity ? ModerationMapper.toDomain(entity) : null;
  }

  async find(options: {
    where:
      | FindOptionsWhere<ModerationEntity>
      | FindOptionsWhere<ModerationEntity>[];
    relations?: string[];
    order?: { [P in keyof ModerationEntity]?: 'ASC' | 'DESC' };
    skip?: number;
    take?: number;
  }): Promise<Moderation[]> {
    const entities = await this.repository.find({
      where: options.where,
      relations: options.relations || [],
      skip: options.skip,
      take: options.take,
    });
    
    return entities.map((entity) => ModerationMapper.toDomain(entity));
  }

  async findManyWithPagination(options: {
    filterOptions?: {
      userId?: number;
      actionType?: ModerationActionType;
      status?: string;
      reportId?: number;
    };
    paginationOptions?: IPaginationOptions;
  }): Promise<Moderation[]> {
    const where: FindOptionsWhere<ModerationEntity> = {};

    // Build where conditions
    if (options.filterOptions?.userId) {
      where.userId = options.filterOptions.userId;
    }

    if (options.filterOptions?.actionType) {
      where.actionType = options.filterOptions.actionType;
    }

    if (options.filterOptions?.status) {
      where.status = options.filterOptions.status as ModerationStatus;
    }

    if (options.filterOptions?.reportId) {
      where.reportId = options.filterOptions.reportId;
    }

    const entities = await this.repository.find({
      where,
      skip: options.paginationOptions
        ? (options.paginationOptions.page - 1) * options.paginationOptions.limit
        : undefined,
      take: options.paginationOptions?.limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['user', 'user.status', 'user.role', 'report', 'report.reporter', 'report.reportedUser'],
    });

    return entities.map((entity) => ModerationMapper.toDomain(entity));
  }

  async update(
    id: Moderation['id'],
    payload: Partial<Moderation>,
  ): Promise<Moderation> {
    const entity = await this.repository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Moderation record not found');
    }

    const updatedEntity = await this.repository.save(
      this.repository.create(
        ModerationMapper.toPersistence({
          ...ModerationMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    // Load relations after update
    const entityWithRelations = await this.repository.findOne({
      where: { id: updatedEntity.id },
      relations: ['user', 'user.status', 'user.role', 'report', 'report.reporter', 'report.reportedUser'],
    });

    return ModerationMapper.toDomain(entityWithRelations!);
  }

  async remove(id: Moderation['id']): Promise<void> {
    await this.repository.softDelete(id);
  }
}