import { ChatController } from './chat.controller';

describe('ChatController', () => {
  let controller: ChatController;
  let service: {
    create: jest.Mock;
    findAllConversations: jest.Mock;
    findAllChats: jest.Mock;
    checkUserOnline: jest.Mock;
  };

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAllConversations: jest.fn(),
      findAllChats: jest.fn(),
      checkUserOnline: jest.fn(),
    };
    controller = new ChatController(service as never);
  });

  it('should create a chat with the authenticated user id', () => {
    service.create.mockReturnValue('chat');
    expect(
      controller.create({ message: 'hi', recipientId: 3 }, {
        user: { id: 5 },
      } as never),
    ).toBe('chat');
    expect(service.create).toHaveBeenCalledWith(
      { message: 'hi', recipientId: 3 },
      5,
    );
  });

  it('should get all conversations for the authenticated user', async () => {
    service.findAllConversations.mockResolvedValue([]);
    await expect(
      controller.findAllConversations({ user: { id: 5 } } as never),
    ).resolves.toEqual([]);
    expect(service.findAllConversations).toHaveBeenCalledWith(5);
  });

  it('should get the chat history with a user', async () => {
    service.findAllChats.mockResolvedValue([]);
    await expect(
      controller.findAllChat({ user: { id: 5 } } as never, 3),
    ).resolves.toEqual([]);
    expect(service.findAllChats).toHaveBeenCalledWith(5, 3);
  });

  it('should return the online status of a user', () => {
    service.checkUserOnline.mockReturnValue(true);
    expect(controller.getOneUserStatus(3)).toEqual({ isOnline: true });
    expect(service.checkUserOnline).toHaveBeenCalledWith(3);
  });
});
