import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { User } from '@users/domain/user';

import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRepository } from './infrastructure/persistence/chat.repository';
import { Chat, ChatStatus } from './domain/chat';
import { Conversation } from './domain/conversation';
import { UsersService } from '@users/users.service';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { SocketService } from '../socket/socket.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTypeEnum } from '../notifications/notification-type.enum';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly socketService: SocketService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createChatDto: CreateChatDto, userId: number) {
    const sender = await this.userService.findById(userId);
    if (!sender) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const recipient = await this.userService.findById(
      createChatDto.recipientId,
    );
    if (!recipient) {
      throw new NotFoundException(
        `Recipient with id ${createChatDto.recipientId} not found`,
      );
    }

    const chat = new Chat(createChatDto);
    chat.senderId = userId;

    return this.chatRepository.create(
      { ...chat, chatType: createChatDto.chatType },
      sender,
      recipient,
    );
  }

  async findAllConversations(userId: User['id']): Promise<Conversation[]> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const chats = await this.chatRepository.findByUser(userId);
    if (!chats || chats.length === 0) {
      return [];
    }

    const unreadMap = new Map<number, number>();
    const unreadList = await this.countUnreadMessages(userId);
    unreadList.forEach(({ senderId, unread }) => {
      unreadMap.set(senderId, unread);
    });

    const conversations: Conversation[] = [];
    for (const chat of chats) {
      const recipientId =
        chat.sender.id === userId ? chat.recipient.id : chat.sender.id;
      if (conversations.some((conv) => conv.recipient.id === recipientId)) {
        continue;
      }
      const conversation = new Conversation();
      conversation.recipient =
        chat.sender.id === userId ? chat.recipient : chat.sender;
      conversation.last_message = chat;
      conversation.isUnread = chat.readAt === null;
      conversation.unreadCount =
        unreadMap.get(
          chat.sender.id === userId
            ? Number(chat.recipient.id)
            : Number(chat.sender.id),
        ) || 0;
      conversations.push(conversation);
      conversation.isOnline =
        await this.socketService.isUserOnline(recipientId);
    }
    conversations.sort(
      (a, b) =>
        b.last_message.createdAt.getTime() - a.last_message.createdAt.getTime(),
    );
    return conversations;
  }

  async findAllChats(myId: User['id'], userId: User['id']): Promise<Chat[]> {
    const myUser = await this.userService.findById(myId);
    if (!myUser) {
      throw new NotFoundException(`User with id ${myId} not found`);
    }
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    // Update pagination logic as needed
    return this.chatRepository.findByUsers(myId, userId);
  }

  async remove(id: Chat['id']) {
    const chat = await this.chatRepository.findById(id);
    if (!chat) {
      throw new NotFoundException(`Chat with id ${id} not found`);
    }
    chat.status = ChatStatus.DELETED;
    return this.chatRepository.update(chat);
  }

  async update(id: Chat['id'], updateChatDto: CreateChatDto) {
    const chat = await this.chatRepository.findById(id);
    if (!chat) {
      throw new NotFoundException(`Chat with id ${id} not found`);
    }
    Object.assign(chat, updateChatDto);
    return this.chatRepository.update(chat);
  }

  async markMessagesAsRead(from: Chat['senderId'], to: Chat['recipientId']) {
    await this.prisma.chat.updateMany({
      where: {
        recipientId: to,
        senderId: from,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  checkUserOnline(userId: User['id']) {
    return this.socketService.isUserOnline(userId);
  }

  @Cron('0 */30 * * * *', { timeZone: 'UTC' }) // Every 30 mins
  async remindPendingMessages() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const staleUnread = await this.prisma.chat.findMany({
      where: {
        readAt: null,
        deletedAt: null,
        createdAt: { lte: cutoff },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (staleUnread.length === 0) {
      return;
    }

    // Only remind once per (sender -> recipient) conversation direction per
    // run, using the oldest unanswered message in that direction.
    const earliestByPair = new Map<string, (typeof staleUnread)[number]>();
    for (const chat of staleUnread) {
      const key = `${chat.senderId}->${chat.recipientId}`;
      if (!earliestByPair.has(key)) {
        earliestByPair.set(key, chat);
      }
    }

    this.logger.log(
      `[CRON] Found ${earliestByPair.size} conversation(s) with messages unanswered for 24h+`,
    );

    for (const chat of earliestByPair.values()) {
      const alreadyNotified = await this.prisma.notification.findFirst({
        where: {
          type: { name: NotificationTypeEnum.pendingMessage },
          relatedEntityId: chat.id,
          deletedAt: null,
        },
      });

      if (alreadyNotified) {
        continue;
      }

      await this.notificationsService.pushNoti({
        senderId: chat.senderId,
        recipientId: chat.recipientId,
        type: NotificationTypeEnum.pendingMessage,
        relatedEntityId: chat.id,
      });
    }
  }

  private async countUnreadMessages(userId: User['id']) {
    const unreadCounts = await this.prisma.chat.groupBy({
      by: ['senderId'],
      where: {
        recipientId: Number(userId),
        readAt: null,
      },
      _count: {
        id: true,
      },
    });

    return unreadCounts.map((item) => ({
      senderId: item.senderId,
      unread: item._count.id,
    }));
  }
}
