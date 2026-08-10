import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from '@mail/mail.service';

@Processor('mail')
export class MailProcessor {
  constructor(private readonly mailService: MailService) {}

  @Process('story-submitted')
  async handleStorySubmitted(job: Job) {
    await this.mailService.storySubmitted(job.data);
  }

  @Process('story-rejected')
  async handleStoryRejected(job: Job) {
    await this.mailService.storyRejected(job.data);
  }

  @Process('story-approved')
  async handleStoryApproved(job: Job) {
    await this.mailService.storyApproved(job.data);
  }

  @Process('welcome-huber')
  async handleWelcomeHuber(job: Job) {
    await this.mailService.welcomeHuber(job.data);
  }
}
