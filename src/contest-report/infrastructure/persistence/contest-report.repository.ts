export abstract class ContestReportRepository {
  abstract save(filename: string, content: string | Buffer): Promise<void>;

  abstract findLatestFilename(safeTopic: string): string | null;

  abstract getFilePath(filename: string): string | null;
}
