import { Injectable } from '@nestjs/common';
import { Kafka, Admin, Producer } from 'kafkajs';
import { MessageBroker } from './interfaces/message-broker.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedPandaBrokerService implements MessageBroker {
  private kafka: Kafka;
  private admin: Admin;
  private producer: Producer;

  constructor(private configService: ConfigService) {
    const broker = this.configService.getOrThrow<string>('REDPANDA_BROKER_URL');
    const mechanism = this.configService.getOrThrow<'scram-sha-256'>(
      'REDPANDA_SASL_MECHANISM',
    );
    const username = this.configService.getOrThrow<string>('REDPANDA_USERNAME');
    const password = this.configService.getOrThrow<string>('REDPANDA_PASSWORD');

    this.kafka = new Kafka({
      brokers: [broker],
      ssl: {},
      sasl: {
        mechanism,
        username,
        password,
      },
    });

    this.admin = this.kafka.admin();
    this.producer = this.kafka.producer();
  }

  async connect() {
    await this.admin.connect();
    await this.producer.connect();
  }

  async disconnect() {
    await this.admin.disconnect();
    await this.producer.disconnect();
  }

  async sendMessage(topic: string, messages: any[]) {
    await this.producer.send({
      topic,
      messages,
    });
  }
}
