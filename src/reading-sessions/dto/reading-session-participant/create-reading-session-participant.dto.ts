import { IsUUID, IsInt } from 'class-validator';

export class CreateReadingSessionParticipantDto {
  @IsUUID()
  readingSessionId: string;

  @IsInt()
  participantId: number;
}
