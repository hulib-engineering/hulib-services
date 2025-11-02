import { PartialType } from '@nestjs/swagger';
import { AddEducationDto } from './add-education.dto';

export class UpdateEducationDto extends PartialType(AddEducationDto) {}
