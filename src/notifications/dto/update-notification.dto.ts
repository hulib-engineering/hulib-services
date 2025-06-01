// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreatenotificationDto } from './create-notification.dto';

export class UpdatenotificationDto extends PartialType(CreatenotificationDto) {}
