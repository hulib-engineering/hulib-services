import { readFileSync } from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { MailService } from './mail.service';

describe('Meeting confirmation email', () => {
  it('should render the details and a safe link to the session', async () => {
    const mailer = { sendMail: jest.fn().mockResolvedValue(undefined) };
    const config = {
      getOrThrow: jest.fn((key: string) =>
        key === 'app.frontendDomain' ? 'https://example.com' : process.cwd(),
      ),
    };
    const translations = JSON.parse(
      readFileSync(
        path.join(process.cwd(), 'src/i18n/vi/meeting-email.json'),
        'utf8',
      ),
    );
    const i18n = {
      t: (key: string) =>
        key
          .split('.')
          .slice(1)
          .reduce((value, part) => value[part], translations),
    };
    const service = new MailService(
      mailer as never,
      config as never,
      i18n as never,
    );
    await service.meetingConfirmed({
      to: 'reader@example.com',
      data: {
        sessionId: 42,
        recipientName: 'Hoa',
        huberName: '<Thao>',
        meetingDate: '18/11/2026',
        meetingTime: '14:00 - 14:30',
      },
    });
    const options = mailer.sendMail.mock.calls[0][0];
    expect(options.to).toBe('reader@example.com');
    expect(options.context.meetingUrl).toBe(
      'https://example.com/my-schedule/42',
    );
    const html = Handlebars.compile(
      readFileSync(
        path.join(
          process.cwd(),
          'src/mail/mail-templates/meeting-confirmed.hbs',
        ),
        'utf8',
      ),
    )(options.context);
    expect(html).toContain('&lt;Thao&gt;');
    expect(html).toContain('Lịch hẹn của bạn đã được xác nhận');
    expect(html).toContain('14:00 - 14:30');
  });
});
