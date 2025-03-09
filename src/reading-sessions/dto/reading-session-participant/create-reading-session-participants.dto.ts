import { IsUUID, IsNumber, IsArray } from 'class-validator';

export class CreateReadingSessionParticipantsDto {
  @IsUUID()
  readingSessionId: string;

  @IsArray()
  @IsNumber({}, { each: true })
  participantIds: number[];
}
