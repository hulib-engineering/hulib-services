// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateHuberDto } from './create-huber.dto';

export class UpdateHuberDto extends PartialType(CreateHuberDto) {}
