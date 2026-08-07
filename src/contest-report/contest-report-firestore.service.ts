import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import {
  FieldValue,
  Firestore,
  Timestamp,
  getFirestore,
} from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';
import { ContestReportService } from './contest-report.service';

type ContestReportFirestoreDocument = {
  filename: string;
  topic: string;
  fileContentBase64: string;
  fileContent?: string;
  csvContent?: string;
  generatedAt: string;
  createdAt?: Timestamp;
  rowCount: number;
  sizeBytes: number;
};

export type ContestReportFirestoreFile = {
  id: string;
  filename: string;
  topic: string;
  fileContentBase64: string;
  generatedAt: string;
  createdAt: string | null;
  rowCount: number;
  sizeBytes: number;
};

@Injectable()
export class ContestReportFirestoreService implements OnModuleInit {
  private readonly logger = new Logger(ContestReportFirestoreService.name);
  private firestore: Firestore | null = null;
  private readonly databaseId =
    process.env.FIRESTORE_DATABASE_ID ||
    process.env.FIREBASE_FIRESTORE_DATABASE_ID;
  private readonly collectionName = 'contest_reports';
  private readonly cronTopic = 'khoanhkhac';

  constructor(private readonly contestReportService: ContestReportService) {}

  onModuleInit() {
    this.initializeFirestore();
  }

  @Cron('0 0 17 * * *') // Every day at 00:00 VN time (17:00 UTC)
  async generateEveryFiveMinutes() {
    this.logger.log(
      `Starting Firestore contest report generation for topic: ${this.cronTopic}`,
    );
    const report = await this.generateAndSave();
    this.logger.log(`Firestore contest report saved: ${report.filename}`);
  }

  async generateAndSave(
    topic = this.cronTopic,
  ): Promise<ContestReportFirestoreFile> {
    const firestore = this.getFirestore();
    const filename = await this.contestReportService.generate(topic);
    const filePath = this.contestReportService.getFilePath(filename);
    const fileBuffer = await readFile(filePath);
    const generatedAt = new Date().toISOString();

    const report: ContestReportFirestoreDocument = {
      filename,
      topic,
      fileContentBase64: fileBuffer.toString('base64'),
      generatedAt,
      rowCount: 0,
      sizeBytes: fileBuffer.length,
    };

    await firestore.collection(this.collectionName).doc(filename).set({
      ...report,
      createdAt: FieldValue.serverTimestamp(),
    });
    await this.deleteOldReports();

    return {
      id: filename,
      ...report,
      createdAt: null,
    };
  }

  async findAll(): Promise<ContestReportFirestoreFile[]> {
    const firestore = this.getFirestore();
    const snapshot = await firestore
      .collection(this.collectionName)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((document) => {
      const data = document.data() as ContestReportFirestoreDocument;
      const fileContentBase64 =
        data.fileContentBase64 ??
        Buffer.from(data.fileContent ?? data.csvContent ?? '', 'utf8').toString(
          'base64',
        );
      return {
        id: document.id,
        filename: data.filename,
        topic: data.topic,
        fileContentBase64,
        generatedAt: data.generatedAt,
        createdAt: data.createdAt?.toDate().toISOString() ?? null,
        rowCount: data.rowCount,
        sizeBytes: data.sizeBytes,
      };
    });
  }

  async findOne(filename: string): Promise<ContestReportFirestoreFile> {
    const firestore = this.getFirestore();
    const document = await firestore
      .collection(this.collectionName)
      .doc(filename)
      .get();

    if (!document.exists) {
      throw new ServiceUnavailableException(
        `Firestore report not found: ${filename}`,
      );
    }

    const data = document.data() as ContestReportFirestoreDocument;
    const fileContentBase64 =
      data.fileContentBase64 ??
      Buffer.from(data.fileContent ?? data.csvContent ?? '', 'utf8').toString(
        'base64',
      );
    return {
      id: document.id,
      filename: data.filename,
      topic: data.topic,
      fileContentBase64,
      generatedAt: data.generatedAt,
      createdAt: data.createdAt?.toDate().toISOString() ?? null,
      rowCount: data.rowCount,
      sizeBytes: data.sizeBytes,
    };
  }

  private async deleteOldReports(): Promise<void> {
    const firestore = this.getFirestore();
    const snapshot = await firestore
      .collection(this.collectionName)
      .orderBy('createdAt', 'desc')
      .get();
    const oldDocuments = snapshot.docs.slice(5);

    if (oldDocuments.length === 0) {
      return;
    }

    const batch = firestore.batch();
    oldDocuments.forEach((document) => batch.delete(document.ref));
    await batch.commit();
    this.logger.log(`Deleted ${oldDocuments.length} old Firestore reports`);
  }

  private initializeFirestore(): void {
    if (this.firestore) {
      return;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (getApps().length === 0) {
      initializeApp({
        credential:
          clientEmail && privateKey
            ? cert({ projectId, clientEmail, privateKey })
            : applicationDefault(),
        projectId,
      });
    }

    this.firestore = this.databaseId
      ? getFirestore(this.databaseId)
      : getFirestore();
    this.logger.log(
      `Initialized Firestore database: ${this.databaseId || '(default)'}`,
    );
  }

  private getFirestore(): Firestore {
    if (!this.firestore) {
      this.initializeFirestore();
    }

    if (!this.firestore) {
      throw new ServiceUnavailableException('Firestore is not configured');
    }

    return this.firestore;
  }
}
