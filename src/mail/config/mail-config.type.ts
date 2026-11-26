export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  storyAdminEmail: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
};
