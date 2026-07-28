import * as ExcelJS from 'exceljs';

export abstract class ContestReportRepository {
  abstract save(filename: string, workbook: ExcelJS.Workbook): Promise<void>;

  abstract findLatestFilename(safeTopic: string): string | null;

  abstract getFilePath(filename: string): string | null;
}
