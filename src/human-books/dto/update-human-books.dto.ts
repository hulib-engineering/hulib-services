// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateHumanBooksDto } from './create-human-books.dto';

export class UpdateHumanBooksDto extends PartialType(CreateHumanBooksDto) {}
