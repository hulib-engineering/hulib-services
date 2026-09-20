import { NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatStatus } from './domain/chat';
import { Conversation } from './domain/conversation';

describe('ChatService', () => {
  let service: ChatService;
  let chatRepository: {
    create: jest.Mock;
    findByUser: jest.Mock;
    findByUsers: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    markMessagesAsRead: jest.Mock;
    countUnreadMessages: jest.Mock;
  };
  let usersService: { findById: jest.Mock };
  let socketService: { isUserOnline: jest.Mock };

  const makeUser = (id: number) => ({ id, fullName: `User ${id}` }) as never;

  const makeChat = (overrides: Record<string, unknown> = {}): any =>
    ({
      id: 1,
      message: 'hi',
      senderId: 5,
      recipientId: 3,
      sender: { id: 5 },
      recipient: { id: 3 },
      status: ChatStatus.SENT,
      readAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      ...overrides,
    }) as never;

  beforeEach(() => {
    chatRepository = {
      create: jest.fn(),
      findByUser: jest.fn(),
      findByUsers: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      markMessagesAsRead: jest.fn(),
      countUnreadMessages: jest.fn(),
    };
    usersService = { findById: jest.fn() };
    socketService = { isUserOnline: jest.fn() };
    service = new ChatService(
      chatRepository as never,
      usersService as never,
      socketService as never,
    );
  });

  describe('create', () => {
    it('should throw NotFound when the sender does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        service.create({ message: 'hi', recipientId: 3 }, 5),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw NotFound when the recipient does not exist', async () => {
      usersService.findById
        .mockResolvedValueOnce(makeUser(5))
        .mockResolvedValueOnce(null);

      await expect(
        service.create({ message: 'hi', recipientId: 3 }, 5),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should create a chat from sender to recipient', async () => {
      usersService.findById.mockResolvedValueOnce(makeUser(5));
      usersService.findById.mockResolvedValueOnce(makeUser(3));
      const dto = { message: 'hi', recipientId: 3, chatType: { id: 1 } };
      chatRepository.create.mockResolvedValue({ id: 1 });

      await service.create(dto, 5);

      expect(chatRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'hi',
          recipientId: 3,
          senderId: 5,
          chatType: { id: 1 },
        }),
        expect.objectContaining({ id: 5 }),
        expect.objectContaining({ id: 3 }),
      );
    });
  });

  describe('findAllConversations', () => {
    it('should return an empty array when the user has no chats', async () => {
      usersService.findById.mockResolvedValue(makeUser(5));
      chatRepository.findByUser.mockResolvedValue([]);

      await expect(service.findAllConversations(5)).resolves.toEqual([]);
    });

    it('should build one conversation per recipient, marked with unread count and online status', async () => {
      usersService.findById.mockResolvedValue(makeUser(5));
      chatRepository.findByUser.mockResolvedValue([
        makeChat({
          id: 1,
          senderId: 5,
          sender: { id: 5 },
          recipient: { id: 3 },
        }),
        makeChat({
          id: 2,
          senderId: 3,
          sender: { id: 3 },
          recipient: { id: 5 },
        }),
      ]);
      chatRepository.countUnreadMessages.mockResolvedValue([
        { senderId: 3, unread: 2 },
      ]);
      socketService.isUserOnline.mockResolvedValue(true);

      const result = await service.findAllConversations(5);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Conversation);
      expect(result[0].last_message.id).toBe(1);
      expect(result[0].unreadCount).toBe(2);
      expect(result[0].isUnread).toBe(true);
      expect(result[0].isOnline).toBe(true);
    });

    it('should sort conversations by most recent message', async () => {
      usersService.findById.mockResolvedValue(makeUser(5));
      const older = makeChat({
        id: 1,
        senderId: 3,
        sender: { id: 3 },
        recipient: { id: 5 },
        createdAt: new Date('2024-01-01'),
      });
      const newer = makeChat({
        id: 2,
        senderId: 4,
        sender: { id: 4 },
        recipient: { id: 5 },
        createdAt: new Date('2024-01-02'),
      });
      chatRepository.findByUser.mockResolvedValue([older, newer]);
      chatRepository.countUnreadMessages.mockResolvedValue([]);
      socketService.isUserOnline.mockResolvedValue(false);

      const result = await service.findAllConversations(5);

      expect(result[0].last_message.id).toBe(2);
      expect(result[1].last_message.id).toBe(1);
    });
  });

  describe('findAllChats', () => {
    it('should throw NotFound when the requesting user does not exist', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.findAllChats(5, 3)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should delegate to findByUsers when both users exist', async () => {
      usersService.findById.mockResolvedValueOnce(makeUser(5));
      usersService.findById.mockResolvedValueOnce(makeUser(3));
      chatRepository.findByUsers.mockResolvedValue([]);

      await expect(service.findAllChats(5, 3)).resolves.toEqual([]);
      expect(chatRepository.findByUsers).toHaveBeenCalledWith(5, 3);
    });
  });

  describe('remove', () => {
    it('should throw NotFound when the chat does not exist', async () => {
      chatRepository.findById.mockResolvedValue(null);

      await expect(service.remove(9)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should soft-delete the chat', async () => {
      chatRepository.findById.mockResolvedValue(makeChat({ id: 1 }));
      chatRepository.update.mockResolvedValue(null);

      await service.remove(1);

      expect(chatRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: ChatStatus.DELETED }),
      );
    });
  });

  describe('update', () => {
    it('should throw NotFound when the chat does not exist', async () => {
      chatRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(9, { message: 'x', recipientId: 3 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should merge the dto into the existing chat and persist it', async () => {
      const chat = makeChat({ id: 1, message: 'old' });
      chatRepository.findById.mockResolvedValue(chat);
      chatRepository.update.mockResolvedValue(chat);

      await service.update(1, { message: 'new', recipientId: 3 });

      expect(chat.message).toBe('new');
      expect(chatRepository.update).toHaveBeenCalledWith(chat);
    });
  });

  describe('markMessagesAsRead and checkUserOnline', () => {
    it('should delegate markMessagesAsRead to the repository', async () => {
      await service.markMessagesAsRead(5, 3);
      expect(chatRepository.markMessagesAsRead).toHaveBeenCalledWith(5, 3);
    });

    it('should delegate checkUserOnline to the socket service', async () => {
      socketService.isUserOnline.mockResolvedValue(false);
      await expect(service.checkUserOnline(5)).resolves.toBe(false);
      expect(socketService.isUserOnline).toHaveBeenCalledWith(5);
    });
  });
});
