import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StoriesService } from '@stories/stories.service';
import { ContestUser } from './domain/contest-report';
import { ContestReportRepository } from './infrastructure/persistence/contest-report.repository';

type ContestReportRow = {
  fullName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  storyId?: number;
  storyTitle?: string | null;
  storyAbstract?: string | null;
  createdAt?: string | null;
  likeCount?: number;
  shareCount?: number;
  commentCount?: number;
};

const CONTEST_REPORT_COLUMNS: Array<{
  header: string;
  key: keyof ContestReportRow;
}> = [
  { header: 'Full Name', key: 'fullName' },
  { header: 'Email', key: 'email' },
  { header: 'Phone', key: 'phoneNumber' },
  { header: 'Bio', key: 'bio' },
  { header: 'Story ID', key: 'storyId' },
  { header: 'Story Title', key: 'storyTitle' },
  { header: 'Story Abstract', key: 'storyAbstract' },
  { header: 'Created At', key: 'createdAt' },
  { header: 'Likes', key: 'likeCount' },
  { header: 'Shares', key: 'shareCount' },
  { header: 'Comments', key: 'commentCount' },
];

function escapeHtmlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r\n|\n|\r/g, '<br>');
}

function escapeXmlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r\n|\n|\r/g, '&#10;');
}

function getColumnName(index: number): string {
  let columnName = '';
  let value = index + 1;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    value = Math.floor((value - 1) / 26);
  }

  return columnName;
}

function buildInlineStringCell(value: unknown, cellRef: string): string {
  return `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escapeXmlValue(value)}</t></is></c>`;
}

function buildWorksheetXml(rows: ContestReportRow[]): string {
  const headerRow = `<row r="1">${CONTEST_REPORT_COLUMNS.map((column, index) =>
    buildInlineStringCell(column.header, `${getColumnName(index)}1`),
  ).join('')}</row>`;
  const bodyRows = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      const cells = CONTEST_REPORT_COLUMNS.map((column, columnIndex) =>
        buildInlineStringCell(
          row[column.key],
          `${getColumnName(columnIndex)}${rowNumber}`,
        ),
      ).join('');
      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join('');
  const lastCell = `${getColumnName(CONTEST_REPORT_COLUMNS.length - 1)}${
    rows.length + 1
  }`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
          <dimension ref="A1:${lastCell}"/>
          <sheetData>${headerRow}${bodyRows}</sheetData>
        </worksheet>`;
}

function makeCrc32Table(): number[] {
  const table: number[] = [];
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }

  return table;
}

const CRC32_TABLE = makeCrc32Table();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: Array<{ name: string; content: string }>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  files.forEach((file) => {
    const name = Buffer.from(file.name, 'utf8');
    const content = Buffer.from(file.content, 'utf8');
    const crc = crc32(content);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + content.length;
  });

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
}

function buildXlsx(rows: ContestReportRow[]): Buffer {
  return createZip([
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Contest Participants" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content: buildWorksheetXml(rows),
    },
  ]);
}

@Injectable()
export class ContestReportService {
  private readonly logger = new Logger(ContestReportService.name);
  private readonly MAX_EXPORT_ROWS =
    Number(process.env.CONTEST_REPORT_MAX_ROWS) || 10000;

  constructor(
    private readonly storiesService: StoriesService,
    private readonly contestReportRepository: ContestReportRepository,
  ) {}

  @Cron(process.env.CONTEST_REPORT_CRON || CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyReport() {
    this.logger.log('Starting daily contest report generation...');
    const filename = await this.generate();
    this.logger.log(`Daily report saved: ${filename}`);
  }

  private sanitizeTopicName(topicName: string): string {
    return (
      topicName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\u0111/g, 'd')
        .replace(/\u0110/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .substring(0, 30) || 'topic'
    );
  }

  async generate(topicName = 'Khoảnh khắc'): Promise<string> {
    const contestParticipants =
      await this.storiesService.getContestParticipants(topicName);
    const users = Array.isArray(contestParticipants)
      ? contestParticipants
      : contestParticipants.data;

    const rows: ContestReportRow[] = (users as ContestUser[])
      .slice(0, this.MAX_EXPORT_ROWS)
      .flatMap<ContestReportRow>((user) => {
        if (user.stories.length === 0) {
          return [
            {
              fullName: user.fullName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              bio: user.bio,
            },
          ];
        }
        return user.stories.map((story) => ({
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
          storyId: story.id,
          storyTitle: story.title,
          storyAbstract: story.abstract,
          createdAt: story.createdAt
            ? new Date(story.createdAt)
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ')
            : '',
          likeCount: story.likeCount,
          shareCount: story.shareCount,
          commentCount: story._count?.storyReview ?? 0,
        }));
      })
      .sort((currentRow, nextRow) =>
        (nextRow.createdAt ?? '').localeCompare(currentRow.createdAt ?? ''),
      );

    const now = new Date();
    const timestamp = [
      String(now.getDate()).padStart(2, '0'),
      String(now.getMonth() + 1).padStart(2, '0'),
      now.getFullYear(),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
    ].join('-');
    const safeTopic = this.sanitizeTopicName(topicName);
    const filename = `contest-report-${timestamp}-${safeTopic}.xlsx`;
    await this.contestReportRepository.save(filename, buildXlsx(rows));
    return filename;
  }

  getLatestFilename(topicName = 'Khoảnh khắc'): string {
    const safeTopic = this.sanitizeTopicName(topicName);
    const filename = this.contestReportRepository.findLatestFilename(safeTopic);
    if (!filename) {
      throw new NotFoundException('No report files found');
    }
    return filename;
  }

  getFilePath(filename: string): string {
    const filePath = this.contestReportRepository.getFilePath(filename);
    if (!filePath) {
      throw new NotFoundException(`Report file not found: ${filename}`);
    }
    return filePath;
  }
}
