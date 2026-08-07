import { ApiProperty } from '@nestjs/swagger';

export class GeneratedContestReportDto {
  @ApiProperty({
    example: 'contest-report-DD-MM-YYYY-HH-mm-<topic-name>.xlsx',
  })
  filename?: string;
}
