import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrackingEvent } from './interfaces/tracking-event.interface';
import { MessageBroker } from './interfaces/message-broker.interface';
import { RedPandaBrokerService } from './redpanda.service';

@Injectable()
export class EventService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventService.name);
  private messageBroker: MessageBroker;

  constructor(
    private configService: ConfigService,
    private redPandataBrokerService: RedPandaBrokerService,
  ) {
    const brokerType = this.configService.get<string>(
      'BROKER_TYPE',
      'redpanda',
    );
    if (brokerType === 'redpanda') {
      this.messageBroker = this.redPandataBrokerService;
    } else {
    }
  }

  async onModuleInit() {
    await this.messageBroker.connect();
  }

  async onModuleDestroy() {
    await this.messageBroker.disconnect();
  }

  async trackEvent(eventName: string, event: TrackingEvent) {
    try {
      const message = {
        key: `${eventName}-${event.timestamp || Date.now()}`,
        value: JSON.stringify({
          ...event,
          timestamp: event.timestamp || Date.now(),
        }),
      };

      await this.messageBroker.sendMessage('demo-topic', [message]);

      this.logger.log(`📤 Sent tracking event: ${event.name}`);
    } catch (error) {
      this.logger.error(`Error sending event: ${eventName}`, error);
    }
  }
}
