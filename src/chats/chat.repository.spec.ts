import { FileType } from '@files/domain/file';
import { ChatRepository } from './chat.repository';

jest.mock('@users/user-mapper', () => ({
  basicUserInclude: {},
  UserMapperImplement: { toDomain: (user: unknown) => user },
}));

describe('ChatRepository sticker images', () => {
  it('should preserve FileType serialization for sticker image paths', async () => {
    const now = new Date();
    const prisma = {
      chat: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            sender: {},
            recipient: {},
            stickerId: 2,
            createdAt: now,
            updatedAt: now,
          },
        ]),
      },
      sticker: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 2,
            name: 'sticker',
            image: { id: 'image-id', path: 'Untitled Artwork 2.png' },
            createdAt: now,
            updatedAt: now,
          },
        ]),
      },
    };
    const repository = new ChatRepository(prisma as never);
    const [chat] = await repository.findByUsers(1, 2);
    expect(chat.sticker?.image).toBeInstanceOf(FileType);
    expect(chat.sticker?.image?.path).toBe('Untitled Artwork 2.png');
  });
});
