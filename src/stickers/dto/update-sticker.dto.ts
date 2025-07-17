// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateStickerDto } from './create-sticker.dto';

export class UpdateStickerDto extends PartialType(CreateStickerDto) {}
