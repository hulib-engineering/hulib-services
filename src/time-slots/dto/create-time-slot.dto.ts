import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';

function IsValidStartTime(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidStartTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, _args: ValidationArguments) {
          const regex = /^([0-9]{2}):([0-9]{2})$/;
          if (!regex.test(value)) {
            return false;
          }

          const [hours, minutes] = value.split(':').map(Number);

          if (hours < 0 || hours > 23 || (minutes !== 0 && minutes !== 30)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid time in the format HH:00 or HH:30.`;
        },
      },
    });
  };
}

export class CreateTimeSlotDto {
  @ApiProperty({
    type: Number,
    example: 0,
  })
  @IsNotEmpty()
  dayOfWeek: number;

  @ApiProperty({
    type: String,
    example: '06:00',
  })
  @IsNotEmpty()
  @IsString()
  @IsValidStartTime({
    message: 'startTime must be a valid time in the format HH:00 or HH:30.',
  })
  startTime: string;
}

export class CreateTimeSlotsDto {
  @ApiProperty({
    type: [CreateTimeSlotDto],
    description: 'List of timeSlots',
    example: [
      { dayOfWeek: 0, startTime: '07:00' },
      { dayOfWeek: 2, startTime: '08:00' },
      { dayOfWeek: 4, startTime: '09:00' },
    ],
  })
  @IsArray({ message: 'TimeSlots must be an array' })
  @IsNotEmpty({ message: 'TimeSlots is required' })
  @ValidateNested({
    each: true,
    message: 'Each timeSlot must be an object of CreateTimeSlotDto',
  })
  @Type(() => CreateTimeSlotDto)
  timeSlots: CreateTimeSlotDto[];
}
