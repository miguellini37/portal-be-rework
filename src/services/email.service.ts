import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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

  async sendEmail(options: { to: string; subject: string; body: string }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM ?? 'noreply@portaljobs.net',
        to: options.to,
        subject: options.subject,
        text: options.body,
      });
      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }
}
