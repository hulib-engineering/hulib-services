import { PartialType } from '@nestjs/swagger';
import { AddWorkDto } from './add-work.dto';

export class UpdateWorkDto extends PartialType(AddWorkDto) {}
