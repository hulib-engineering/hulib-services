import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

function IsValidStartTime(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidStartTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
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
