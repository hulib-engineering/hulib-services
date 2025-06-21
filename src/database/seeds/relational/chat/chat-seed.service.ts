import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { ChatStatus } from '../../../../chats/domain/chat';

@Injectable()
export class ChatSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const chatCount = await this.prisma.chat.count();
    if (chatCount > 0) {
      console.log('Chat seed already exists, skipping...');
      return;
    }
    console.log('Seeding chats...');
    for (let i = 1; i <= 5; i++) {
      for (let j = i + 1; j <= 5; j++) {
        const chatData = [
          'Hello, how are you?',
          'I am fine, thank you! And you?',
          'I am doing well, thanks for asking!',
          'What are you up to today?',
          'Just working on some projects, you?',
          'I am just relaxing at home.',
          'That sounds nice! Any plans for the weekend?',
          'Yes, I am going to visit my family.',
          'That sounds great! I hope you have a good time.',
          'Thank you! I hope you have a good weekend too.',
        ].map((message, index) => ({
          senderId: index % 2 === 0 ? i : j,
          recipientId: index % 2 === 0 ? j : i,
          message,
          status: index === 9 ? ChatStatus.READ : ChatStatus.SENT,
        }));
        chatData.forEach(async (chat) => {
          await this.prisma.chat.create({
            data: chat,
            include: {
              sender: true,
              recipient: true,
            },
          });
        });
        console.log(`Created chat between user ${i} and user ${j}`);
      }
    }
  }
}
