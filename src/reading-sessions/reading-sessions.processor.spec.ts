import { ReadingSessionsProcessor } from './reading-sessions.processor';

describe('ReadingSessionsProcessor confirmation email', () => {
  it('should send the reader the approved meeting details', async () => {
    const sessions = {
      findOneSession: jest.fn().mockResolvedValue({
        id: 12,
        reader: { email: 'reader@example.com', fullName: 'Hoa' },
        humanBook: { fullName: 'Thao' },
        startedAt: new Date('2026-11-18T00:00:00Z'),
        startTime: '14:00',
        endTime: '14:30',
      }),
    };
    const mail = { meetingConfirmed: jest.fn().mockResolvedValue(undefined) };
    const processor = new ReadingSessionsProcessor(
      sessions as never,
      mail as never,
      {} as never,
    );
    await processor.handleMeetingConfirmedEmail({
      data: { sessionId: 12 },
    } as never);
    expect(mail.meetingConfirmed).toHaveBeenCalledWith({
      to: 'reader@example.com',
      data: expect.objectContaining({
        sessionId: 12,
        recipientName: 'Hoa',
        huberName: 'Thao',
        meetingTime: '14:00 - 14:30',
      }),
    });
  });
});
