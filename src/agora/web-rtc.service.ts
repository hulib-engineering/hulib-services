import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import axios from 'axios';

import { AllConfigType } from '@config/config.type';
import { ReadingSession } from '@reading-sessions/domain';
import { ReadingSessionsService } from '@reading-sessions/reading-sessions.service';

@Injectable()
export class WebRtcService {
  private baseUrl = 'https://api.agora.io/v1/apps';
  private readonly appId: string;
  private readonly appCert: string;
  private readonly awsDefaultS3Bucket: string;
  private readonly authHeader: { Authorization: string };
  private readonly s3Client: S3Client;

  constructor(
    private readingSessionService: ReadingSessionsService,
    private configService: ConfigService<AllConfigType>,
  ) {
    this.appId = this.configService.getOrThrow('agora.appId', { infer: true });
    this.appCert = this.configService.getOrThrow('agora.appCertificate', {
      infer: true,
    });
    this.awsDefaultS3Bucket = this.configService.getOrThrow(
      'file.awsDefaultS3Bucket',
      {
        infer: true,
      },
    );
    this.authHeader = {
      Authorization: `Basic ${Buffer.from(`${this.configService.getOrThrow('agora.customerId', { infer: true })}:${this.configService.getOrThrow('agora.customerSecret', { infer: true })}`).toString('base64')}`,
    };
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('file.awsS3Region', {
        infer: true,
      }),
      credentials: {
        accessKeyId: this.configService.getOrThrow('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: this.configService.getOrThrow('file.secretAccessKey', {
          infer: true,
        }),
      },
    });
  }

  generateToken(
    sessionData: Pick<
      ReadingSession,
      'id' | 'humanBookId' | 'readerId' | 'story' | 'endedAt' | 'startedAt'
    >,
  ) {
    const role = RtcRole.PUBLISHER;

    // Convert meeting start time to seconds
    const startSeconds = Math.floor(sessionData.startedAt.getTime() / 1000);

    // Token expiry = meeting start + 30 minutes
    const privilegeExpiredTs = startSeconds + 30 * 60;

    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCert,
      `session-${sessionData.id}`,
      0,
      role,
      privilegeExpiredTs, // RTC privilege expiry
      privilegeExpiredTs, // join privilege expiry (same as above)
    );
    return { token };
  }

  buildRecordingToken(channel: string, recordingUid: string) {
    const expireTs = Math.floor(Date.now() / 1000) + 30 * 60;
    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCert,
      channel,
      recordingUid, // non-zero, fixed per session
      RtcRole.PUBLISHER,
      expireTs,
      expireTs,
    );
    return { token, uid: recordingUid };
  }

  async acquireResource(
    channel: string,
    uid: string,
  ): Promise<{ cname: string; resourceId: string; uid: string }> {
    const url = `${this.baseUrl}/${this.appId}/cloud_recording/acquire`;
    try {
      const { data } = await axios.post(
        url,
        {
          cname: channel,
          uid,
          clientRequest: { resourceExpiredHour: 24 },
        },
        { headers: this.authHeader },
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  async startRecording(channel: string) {
    const recordingUid = String(Math.floor(1 + Math.random() * 100000));
    const { resourceId } = await this.acquireResource(channel, recordingUid);
    const url = `${this.baseUrl}/${this.appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
    const { token: recordingToken } = this.buildRecordingToken(
      channel,
      recordingUid,
    );
    try {
      const { data } = await axios.post(
        url,
        {
          cname: channel,
          uid: recordingUid, // random UID > 0
          clientRequest: {
            token: recordingToken, // <-- REQUIRED with certificate ON
            storageConfig: {
              vendor: 1, // 1 = Amazon S3
              region: 3,
              bucket: this.configService.getOrThrow('file.awsDefaultS3Bucket', {
                infer: true,
              }),
              accessKey: this.configService.getOrThrow('file.accessKeyId', {
                infer: true,
              }),
              secretKey: this.configService.getOrThrow('file.secretAccessKey', {
                infer: true,
              }),
              fileNamePrefix: ['recordings'],
            },
            recordingFileConfig: {
              avFileType: ['hls', 'mp4'],
              fileListMode: 'json',
            },
            recordingConfig: {
              maxIdleTime: 30,
              streamTypes: 2,
              channelType: 0,
              videoStreamType: 0,
              transcodingConfig: {
                height: 720,
                width: 1280,
                bitrate: 800,
                fps: 15,
                mixedVideoLayout: 1, // picture-in-picture for 1-on-1
              },
            },
          },
        },
        { headers: this.authHeader },
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  async stopRecording(
    resourceId: string,
    sid: string,
    channel: string,
    uid: string,
  ) {
    const url = `${this.baseUrl}/${this.appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
    try {
      // Attempt to stop the recording
      const { data } = await axios.post(
        url,
        { cname: channel, uid, clientRequest: {} },
        { headers: this.authHeader },
      );
      const fileName = data.serverResponse.fileList[0].fileName;
      await this.readingSessionService.updateSession(
        Number(channel.split('-')[1]),
        {
          recordingUrl: fileName,
        },
      );
      return data;
    } catch (error: any) {
      // If worker not found, we assume recording already stopped
      if (error.response?.data?.reason === 'failed to find worker') {
        return { message: 'Worker already gone, assuming recording stopped.' };
      } else {
        throw error;
      }
    }
  }
}
