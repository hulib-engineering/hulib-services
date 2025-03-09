import { IsNumber, IsOptional } from 'class-validator';

export class FindAllReadingSessionsQueryDto {
  @IsOptional()
  @IsNumber()
  hostId?: number;
}
