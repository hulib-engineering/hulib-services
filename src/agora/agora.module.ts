import { Module } from '@nestjs/common';
import { WebRtcService } from './web-rtc.service';
import { ChatService } from './chat.service';

@Module({
  providers: [WebRtcService, ChatService],
  exports: [WebRtcService, ChatService],
  imports: [],
})
export class AgoraModule {}
