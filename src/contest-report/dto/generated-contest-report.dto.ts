import { ApiProperty } from '@nestjs/swagger';

export class GeneratedContestReportDto {
  @ApiProperty({
    example: 'contest-report-YY-MM-DD-<topic-name>.xlsx',
  })
  filename?: string;
}
