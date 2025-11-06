import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AppealStatus } from '../domain/appeal';

export class ReviewAppealDto {
  @ApiProperty({
    enum: [AppealStatus.accepted, AppealStatus.rejected],
    description: 'New status for the appeal',
    example: AppealStatus.accepted,
    enumName: 'AppealStatus',
  })
  @IsIn([AppealStatus.accepted, AppealStatus.rejected], {
    message: 'Status must be either accepted or rejected',
  })
  status: AppealStatus.accepted | AppealStatus.rejected;
}
