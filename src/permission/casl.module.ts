import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './ability.factory';
import { PermissionService } from './services/permission.service';
import { CaslGuard } from './guards/casl.guard';
import { CaslSerializationInterceptor } from './interceptors/serialization.interceptor';

@Module({
  providers: [
    CaslAbilityFactory,
    PermissionService,
    CaslGuard,
    CaslSerializationInterceptor,
  ],
  exports: [
    CaslAbilityFactory,
    PermissionService,
    CaslGuard,
    CaslSerializationInterceptor,
  ],
})
export class CaslModule {}
