import { Module } from '@nestjs/common';
import { WebRtcService } from './web-rtc.service';

@Module({
  providers: [WebRtcService],
  exports: [WebRtcService],
})
export class WebRtcModule {}
