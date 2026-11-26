import { MailService } from './mail.service';

describe('Admin story submission email', () => {
  it('should send the review notice to the configured admin address', async () => {
    const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };
    const config = {
      getOrThrow: jest.fn(
        (key: string) =>
          ({
            'app.frontendDomain': 'https://example.com',
            'app.workingDirectory': process.cwd(),
            'mail.storyAdminEmail': 'hulibvietnam@gmail.com',
          })[key],
      ),
    };
    const service = new MailService(
      mailer as never,
      config as never,
      {} as never,
    );
    await service.storySubmittedAdmin({ storyId: 7, storyTitle: 'Story' });
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'hulibvietnam@gmail.com',
        subject: 'Câu chuyện mới được gửi',
        throwOnError: true,
        context: expect.objectContaining({
          storyTitle: 'Story',
          buttonUrl: 'https://example.com/admin/awaiting-stories',
        }),
      }),
    );
  });
});
