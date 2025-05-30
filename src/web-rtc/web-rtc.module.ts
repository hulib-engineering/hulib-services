import { Module } from '@nestjs/common';
import { UsersModule } from '@users/users.module';

import { WebRtcService } from './web-rtc.service';

@Module({
  providers: [WebRtcService],
  exports: [WebRtcService],
  imports: [UsersModule],
})
export class WebRtcModule {}
