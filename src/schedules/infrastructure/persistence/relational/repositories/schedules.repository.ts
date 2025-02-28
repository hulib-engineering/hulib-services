import { Injectable } from '@nestjs/common';
import { SchedulesRepository } from '../../schedules.repository';
import { SchedulesEntity } from '../entities/schedules.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SchedulesRelationalRepository implements SchedulesRepository {
  constructor(
    @InjectRepository(SchedulesEntity)
    private readonly storiesRepository: Repository<SchedulesEntity>,
  ) {}
}
