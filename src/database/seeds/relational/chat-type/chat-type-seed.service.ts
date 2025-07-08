import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatTypeEntity } from '@chat-types/infrastructure/persistence/relational/entities/chat-type.entity';
import { ChatTypeEnum } from '@chat-types/chat-types.enum';

@Injectable()
export class ChatTypeSeedService {
  constructor(
    @InjectRepository(ChatTypeEntity)
    private repository: Repository<ChatTypeEntity>,
  ) {}

  async run() {
    const count = await this.repository.count();

    if (!count) {
      await this.repository.save([
        this.repository.create({
          id: ChatTypeEnum.txt,
          name: 'txt',
        }),
        this.repository.create({
          id: ChatTypeEnum.img,
          name: 'img',
        }),
      ]);
    }
  }
}
