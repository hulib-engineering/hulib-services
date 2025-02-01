import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenderEntity } from '@genders/infrastructure/persistence/relational/entities/gender.entity';
import { GenderEnum } from '@genders/genders.enum';

@Injectable()
export class GenderSeedService {
  constructor(
    @InjectRepository(GenderEntity)
    private repository: Repository<GenderEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save([
        this.repository.create({
          id: GenderEnum.male,
          name: 'Male',
        }),
        this.repository.create({
          id: GenderEnum.female,
          name: 'Female',
        }),
        this.repository.create({
          id: GenderEnum.other,
          name: 'Other',
        }),
      ]);
    }
  }
}
