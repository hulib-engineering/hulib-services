import { IsUUID, IsInt, IsDate } from 'class-validator';

export class ReadingSessionParticipantResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  readingSessionId: string;

  @IsInt()
  participantId: number;

  @IsDate()
  createdAt: Date;
}
