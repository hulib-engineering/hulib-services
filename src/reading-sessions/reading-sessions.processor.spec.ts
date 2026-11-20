import { ReadingSessionsProcessor } from './reading-sessions.processor';

describe('ReadingSessionsProcessor confirmation email', () => {
  it('should send booking requests to the huber using their selected language', async () => {
    const sessions = {
      findOneSession: jest.fn().mockResolvedValue({
        id: 12,
        reader: { fullName: 'Hoa' },
        humanBook: {
          email: 'huber@example.com',
          fullName: 'Thao',
          languageCode: 'vi',
        },
        story: { title: 'Story' },
        startedAt: new Date('2026-11-18T00:00:00Z'),
        startTime: '14:00',
        endTime: '14:30',
      }),
    };
    const mail = { sendBookingEmail: jest.fn().mockResolvedValue(undefined) };
    const processor = new ReadingSessionsProcessor(
      sessions as never,
      mail as never,
      {} as never,
    );
    await processor.handleSendBookingEmail({
      data: { sessionId: 12 },
    } as never);
    expect(mail.sendBookingEmail).toHaveBeenCalledWith({
      to: 'huber@example.com',
      data: expect.objectContaining({
        sessionId: 12,
        liberName: 'Hoa',
        locale: 'vi',
      }),
    });
  });

  it('should use each participant language for their reminder', async () => {
    const sessions = {
      findOneSession: jest.fn().mockResolvedValue({
        humanBook: { email: 'huber@example.com', languageCode: 'vi' },
        reader: { email: 'reader@example.com', languageCode: 'en' },
        sessionUrl: 'https://example.com',
      }),
    };
    const mail = { remindParticipants: jest.fn().mockResolvedValue(undefined) };
    const notifications = { getAdminId: jest.fn().mockResolvedValue(null) };
    const processor = new ReadingSessionsProcessor(
      sessions as never,
      mail as never,
      notifications as never,
    );
    await processor.handleSendEmailAndNotifyParticipants({
      data: { sessionId: 12 },
    } as never);
    expect(mail.remindParticipants).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'huber@example.com',
        data: expect.objectContaining({ locale: 'vi', isHuber: true }),
      }),
    );
    expect(mail.remindParticipants).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'reader@example.com',
        data: expect.objectContaining({ locale: 'en', isHuber: false }),
      }),
    );
  });
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
