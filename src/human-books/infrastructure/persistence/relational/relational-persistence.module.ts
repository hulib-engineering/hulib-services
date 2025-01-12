import { Module } from '@nestjs/common';
import { HumanBooksRepository } from '../human-books.repository';
import { HumanBooksRelationalRepository } from './repositories/human-books.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanBooksEntity } from './entities/human-books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HumanBooksEntity])],
  providers: [
    {
      provide: HumanBooksRepository,
      useClass: HumanBooksRelationalRepository,
    },
  ],
  exports: [HumanBooksRepository],
})
export class RelationalHumanBooksPersistenceModule {}
