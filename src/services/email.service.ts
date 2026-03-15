import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const TEST_DOMAIN_MAP: Record<string, string> = {
  'pjobs.edu': 'portaljobs.net',
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'email-smtp.us-east-1.amazonaws.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER ?? process.env.KEYCLOAK_SMTP_USER,
        pass: process.env.SMTP_PASSWORD ?? process.env.KEYCLOAK_SMTP_PASSWORD,
      },
    });
  }

  /**
   * Rewrites test domain emails to their real forwarding address.
   * e.g. user@pjobs.edu → user@portaljobs.net
   */
  private resolveTestDomain(email: string): string {
    const [local, domain] = email.split('@');
    const forwardDomain = TEST_DOMAIN_MAP[domain?.toLowerCase()];
    if (forwardDomain) {
      const resolved = `${local}@${forwardDomain}`;
      this.logger.log(`Test domain rewrite: ${email} → ${resolved}`);
      return resolved;
    }
    return email;
  }

  async sendEmail(options: { to: string; subject: string; body: string }): Promise<void> {
    const to = this.resolveTestDomain(options.to);
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'noreply@portaljobs.net',
        to,
        subject: options.subject,
        text: options.body,
      });
      this.logger.log(`Email sent to ${to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }
}
