import { Module } from '@nestjs/common';
import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@auth/strategies/jwt.strategy';
import { AnonymousStrategy } from '@auth/strategies/anonymous.strategy';
import { JwtRefreshStrategy } from '@auth/strategies/jwt-refresh.strategy';
import { MailModule } from '@mail/mail.module';
import { SessionModule } from '@session/session.module';
import { UsersModule } from '@users/users.module';
import { TopicsModule } from '@topics/topics.module';
import { CaslModule } from '@casl/casl.module';

@Module({
  imports: [
    UsersModule,
    SessionModule,
    PassportModule,
    CaslModule,
    MailModule,
    TopicsModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, AnonymousStrategy],
  exports: [AuthService],
})
export class AuthModule {}
