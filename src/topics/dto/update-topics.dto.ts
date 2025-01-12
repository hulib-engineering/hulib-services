// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateTopicsDto } from './create-topics.dto';

export class UpdateTopicsDto extends PartialType(CreateTopicsDto) {}
