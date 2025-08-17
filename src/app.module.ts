import { Module } from '@nestjs/common';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { UsersModule } from '@users/users.module';
import { FilesModule } from '@files/files.module';
import { AuthModule } from '@auth/auth.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './mail/config/mail.config';
import fileConfig from './files/config/file.config';
import facebookConfig from './auth-facebook/config/facebook.config';
import googleConfig from './auth-google/config/google.config';
import webRtcConfig from './web-rtc/config/web-rtc.config';
import cacheConfig from './cache/config/cache.config';
import agoraConfig from '@agora/config/agora.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthFacebookModule } from '@auth-facebook/auth-facebook.module';
import { AuthGoogleModule } from '@auth-google/auth-google.module';
import { I18nModule } from 'nestjs-i18n/dist/i18n.module';
import { HeaderResolver } from 'nestjs-i18n';
import { TypeOrmConfigService } from '@database/typeorm-config.service';
import { MailModule } from '@mail/mail.module';
import { HomeModule } from '@home/home.module';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from '@config/config.type';
import { SessionModule } from '@session/session.module';
import { MailerModule } from '@mailer/mailer.module';
import { BooksModule } from '@books/book.module';
import { TopicsModule } from '@topics/topics.module';
import { StoriesModule } from '@stories/stories.module';
import { FavStoriesModule } from '@fav-stories/fav-stories.module';
import { StoryReviewsModule } from '@story-reviews/story-reviews.module';
import { PrismaModule } from '@prisma-client/prisma-client.module';
import { SearchModule } from './search/search.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { APP_FILTER } from '@nestjs/core';
import { SchedulesModule } from '@schedules/schedules.module';
import { CaslModule } from '@casl/casl.module';
import { TimeSlotModule } from '@time-slots/time-slots.module';
import { ReadingSessionsModule } from '@reading-sessions/reading-sessions.module';
import { HubersModule } from './hubers/hubers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SocketModule } from './socket/socket.module';
import { CacheModule as CacheManagerModule } from './cache/cache.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketGateway } from './socket/socket.gateway';
import { NotificationGateway } from './notifications/notifications.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from '@chats/chat.module';
import { AgoraModule } from '@agora/agora.module';
import { StickersModule } from './stickers/stickers.module';
import { ChatGateway } from '@chats/chat.gateway';
import { ReportsModule } from './reports/reports.module';

const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize();
  },
});

@Module({
  imports: [
    ReportsModule,
    SocketModule,
    NotificationsModule,
    SentryModule.forRoot(),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    HealthcheckModule,
    StoriesModule,
    FavStoriesModule,
    TopicsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        webRtcConfig,
        cacheConfig,
        agoraConfig,
      ],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow('redis.host', {
            infer: true,
          }),
          port: configService.getOrThrow('redis.port', {
            infer: true,
          }),
          password: configService.getOrThrow('redis.password', {
            infer: true,
          }),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'reminder' }),
    CacheManagerModule,
    UsersModule,
    FilesModule,
    AuthModule,
    AuthFacebookModule,
    AuthGoogleModule,
    SessionModule,
    MailModule,
    MailerModule,
    HomeModule,
    BooksModule,
    StoryReviewsModule,
    PrismaModule,
    SearchModule,
    SchedulesModule,
    CaslModule,
    TimeSlotModule,
    ReadingSessionsModule,
    HubersModule,
    ChatModule,
    AgoraModule,
    StickersModule,
  ],
  providers: [
    SocketGateway,
    NotificationGateway,
    ChatGateway,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
