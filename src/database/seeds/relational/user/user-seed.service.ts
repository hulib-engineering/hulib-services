import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '@roles/roles.enum';
import { StatusEnum } from '@statuses/statuses.enum';
import { UserEntity } from '@users/infrastructure/persistence/relational/entities/user.entity';
import { GenderEnum } from '@genders/genders.enum';
import { faker } from '@faker-js/faker';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async run() {
    const countAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.admin,
        },
      },
    });

    if (!countAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          fullName: 'Super Admin',
          email: 'admin@example.com',
          password,
          role: {
            id: RoleEnum.admin,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }

    const countUser = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.reader,
        },
      },
    });

    if (!countUser) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          password,
          gender: {
            id: GenderEnum.male,
            name: 'Male',
          },
          role: {
            id: RoleEnum.reader,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }

    const countHuber = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.humanBook,
        },
      },
    });

    if (!countHuber) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      const savedHubers = await Promise.all(
        [...Array(5)].map(async () => {
          await this.repository.save(
            this.repository.create({
              fullName: faker.person.fullName(),
              email: faker.internet.email(),
              address: faker.location.streetAddress(),
              parentPhoneNumber: faker.phone.number(),
              phoneNumber: faker.phone.number(),
              bio: faker.lorem.paragraph(),
              videoUrl: faker.internet.url(),
              password,
              gender: {
                id: GenderEnum.other,
                name: 'Other',
              },
              role: {
                id: RoleEnum.humanBook,
                name: 'Human Book',
              },
              status: {
                id: StatusEnum.active,
                name: 'Active',
              },
            }),
          );
        }),
      );

      console.log(`✅ Created ${savedHubers.length} hubers`);
    }
  }
}
