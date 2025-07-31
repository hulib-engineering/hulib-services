import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportEntity } from '../entities/report.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Report } from '../../../../domain/report';
import { ReportRepository } from '../../report.repository';
import { ReportMapper } from '../mappers/report.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ReportRelationalRepository implements ReportRepository {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
  ) {}

  async create(data: Report): Promise<Report> {
    const persistenceModel = ReportMapper.toPersistence(data);
    const newEntity = await this.reportRepository.save(
      this.reportRepository.create(persistenceModel),
    );
    return ReportMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Report[]> {
    const entities = await this.reportRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => ReportMapper.toDomain(entity));
  }

  async findById(id: Report['id']): Promise<NullableType<Report>> {
    const entity = await this.reportRepository.findOne({
      where: { id },
    });

    return entity ? ReportMapper.toDomain(entity) : null;
  }

  async update(id: Report['id'], payload: Partial<Report>): Promise<Report> {
    const entity = await this.reportRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.reportRepository.save(
      this.reportRepository.create(
        ReportMapper.toPersistence({
          ...ReportMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ReportMapper.toDomain(updatedEntity);
  }

  async remove(id: Report['id']): Promise<void> {
    await this.reportRepository.delete(id);
  }
}
