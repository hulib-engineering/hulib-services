import { Injectable } from '@nestjs/common';
import { IPaginationOptions } from '@utils/types/pagination-options';

import { CreateStickerDto } from './dto/create-sticker.dto';
import { StickerRepository } from './infrastructure/persistence/sticker.repository';

@Injectable()
export class StickersService {
  constructor(private readonly stickerRepository: StickerRepository) {}

  create(createStickerDto: CreateStickerDto) {
    return this.stickerRepository.create(createStickerDto);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.stickerRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  // findOne(id: Sticker['id']) {
  //   return this.stickerRepository.findById(id);
  // }
  //
  // update(id: Sticker['id'], updateStickerDto: UpdateStickerDto) {
  //   return this.stickerRepository.update(id, updateStickerDto);
  // }
  //
  // remove(id: Sticker['id']) {
  //   return this.stickerRepository.remove(id);
  // }
}
