import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { storyFavouritesEntity } from '@fav-stories/infrastructure/persistence/relational/entities/fav-stories.entity';
import { Repository } from 'typeorm';

@Injectable()
export class storyFavouritesSeedService {
  constructor(
    @InjectRepository(storyFavouritesEntity)
    private repository: Repository<storyFavouritesEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (count === 0) {
      await this.repository.save(this.repository.create({}));
    }
  }
}
