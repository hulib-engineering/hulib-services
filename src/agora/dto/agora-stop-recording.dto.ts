import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AgoraStopRecordingDto {
  @ApiProperty()
  @IsNotEmpty()
  channel: string;

  @ApiProperty()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty()
  @IsNotEmpty()
  sid: string;

  @ApiProperty()
  @IsNotEmpty()
  uid: string;
}
