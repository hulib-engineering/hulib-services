import { readFileSync } from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { MailService } from './mail.service';

describe('Meeting email languages', () => {
  it('should propagate booking email delivery failures for queue retry', async () => {
    const mailer = {
      sendMail: jest.fn().mockRejectedValue(new Error('SMTP unavailable')),
    };
    const config = {
      getOrThrow: jest.fn((key: string) =>
        key === 'app.frontendDomain' ? 'https://example.com' : process.cwd(),
      ),
    };
    const i18n = { t: jest.fn().mockReturnValue('translation') };
    const service = new MailService(
      mailer as never,
      config as never,
      i18n as never,
    );
    await expect(
      service.sendBookingEmail({
        to: 'huber@example.com',
        data: {
          huberName: 'Thao',
          liberName: 'Hoa',
          sessionDate: '20/11',
          sessionTime: '14:00',
          storyTitle: 'Story',
          message: '',
        },
      }),
    ).rejects.toThrow('SMTP unavailable');
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ throwOnError: true }),
    );
  });
  it.each(['vi', 'en'])(
    'should render all four email variants in %s',
    async (locale) => {
      const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };
      const config = {
        getOrThrow: jest.fn((key: string) =>
          key === 'app.frontendDomain' ? 'https://example.com' : process.cwd(),
        ),
      };
      const i18n = {
        t: (key: string, opts: { lang: string }) => {
          const [file, ...parts] = key.split('.');
          const json = JSON.parse(
            readFileSync(
              path.join(process.cwd(), 'src/i18n', opts.lang, `${file}.json`),
              'utf8',
            ),
          );
          return parts.reduce((value, part) => value[part], json);
        },
      };
      const service = new MailService(
        mailer as never,
        config as never,
        i18n as never,
      );
      await service.meetingConfirmed({
        to: 'reader@example.com',
        data: {
          sessionId: 2,
          recipientName: 'Hoa',
          huberName: 'Thao',
          meetingDate: '20/11/2026',
          meetingTime: '14:00',
          locale,
        },
      });
      await service.sendBookingEmail({
        to: 'huber@example.com',
        data: {
          sessionId: 2,
          huberName: 'Thao',
          liberName: 'Hoa',
          sessionDate: '20/11/2026',
          sessionTime: '14:00',
          storyTitle: 'Story',
          message: '',
          locale,
        },
      });
      await service.remindParticipants({
        to: 'huber@example.com',
        data: {
          name: 'Thao',
          isHuber: true,
          sessionUrl: 'https://example.com/reading',
          locale,
        },
      });
      await service.remindParticipants({
        to: 'reader@example.com',
        data: {
          name: 'Hoa',
          isHuber: false,
          sessionUrl: 'https://example.com/reading',
          locale,
        },
      });
      expect(mailer.sendMail).toHaveBeenCalledTimes(4);
      for (const [options] of mailer.sendMail.mock.calls) {
        const html = Handlebars.compile(
          readFileSync(options.templatePath, 'utf8'),
          { strict: true },
        )(options.context);
        expect(html).toContain(`lang='${locale}'`);
        expect(html).toContain(locale === 'vi' ? 'kết nối' : 'connecting');
      }
      expect(mailer.sendMail.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          to: 'huber@example.com',
          throwOnError: true,
          context: expect.objectContaining({
            schedulingUrl: 'https://example.com/my-schedule/2',
          }),
        }),
      );
    },
  );
});
