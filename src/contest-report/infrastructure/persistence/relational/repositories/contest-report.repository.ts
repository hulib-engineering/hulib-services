import { existsSync, mkdirSync, readdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ContestReportRepository } from '../../contest-report.repository';

export class RelationalContestReportRepository extends ContestReportRepository {
  private readonly reportsDir = join(process.cwd(), 'reports');

  constructor() {
    super();
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async save(filename: string, content: string | Buffer): Promise<void> {
    await writeFile(join(this.reportsDir, filename), content);
  }

  findLatestFilename(safeTopic: string): string | null {
    if (!existsSync(this.reportsDir)) {
      return null;
    }

    const prefix = 'contest-report-';
    const files = readdirSync(this.reportsDir)
      .filter(
        (filename) =>
          filename.startsWith(prefix) &&
          filename.endsWith('.xlsx') &&
          filename.includes(safeTopic),
      )
      .sort()
      .reverse();

    return files[0] ?? null;
  }

  getFilePath(filename: string): string | null {
    const filePath = join(this.reportsDir, filename);
    return existsSync(filePath) ? filePath : null;
  }
}
