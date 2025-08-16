import { Module } from '@nestjs/common';

import { ReadingSessionsModule } from '@reading-sessions/reading-sessions.module';

import { WebRtcService } from './web-rtc.service';
import { ChatService } from './chat.service';
import { AgoraController } from './agora.controller';

@Module({
  controllers: [AgoraController],
  providers: [WebRtcService, ChatService],
  exports: [WebRtcService, ChatService],
  imports: [ReadingSessionsModule],
})
export class AgoraModule {}
