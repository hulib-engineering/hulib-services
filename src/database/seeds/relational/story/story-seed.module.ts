import { Module } from '@nestjs/common';
import { StorySeedService } from './story-seed.service';

@Module({
  providers: [StorySeedService],
  exports: [StorySeedService],
})
export class StorySeedModule {}
