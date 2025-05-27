import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '@roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '@roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async run() {
    const countHumanBooks = await this.repository.count({
      where: {
        id: RoleEnum.humanBook,
      },
    });

    if (!countHumanBooks) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.humanBook,
          name: 'Huber',
        }),
      );
    }

    const countReaders = await this.repository.count({
      where: {
        id: RoleEnum.reader,
      },
    });

    if (!countReaders) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.reader,
          name: 'Liber',
        }),
      );
    }

    const countAdmin = await this.repository.count({
      where: {
        id: RoleEnum.admin,
      },
    });

    if (!countAdmin) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.admin,
          name: 'Admin',
        }),
      );
    }
  }
}
