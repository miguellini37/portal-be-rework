import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as http2 from 'http2';
import * as jwt from 'jsonwebtoken';
import { DeviceToken } from '../entities/DeviceToken';

interface APNSPayload {
  aps: {
    alert: { title: string; body: string };
    sound?: string;
    badge?: number;
    'thread-id'?: string;
    'mutable-content'?: number;
  };
  [key: string]: unknown;
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>
  ) {}

  async registerToken(userId: string, token: string, platform: string = 'apns'): Promise<void> {
    // Check if this token already exists for this user
    const existing = await this.deviceTokenRepository.findOne({
      where: { userId, token },
    });

    if (existing) {
      return;
    }

    // Remove this token if registered to a different user (device switched accounts)
    await this.deviceTokenRepository.delete({ token });

    const deviceToken = this.deviceTokenRepository.create({
      userId,
      token,
      platform,
    });

    await this.deviceTokenRepository.save(deviceToken);
    this.logger.log(`Registered ${platform} token for user ${userId}`);
  }

  async unregisterToken(token: string): Promise<void> {
    await this.deviceTokenRepository.delete({ token });
  }

  async unregisterAllTokens(userId: string): Promise<void> {
    await this.deviceTokenRepository.delete({ userId });
  }

  async sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    const tokens = await this.deviceTokenRepository.find({
      where: { userId },
    });

    if (tokens.length === 0) {
      return;
    }

    for (const deviceToken of tokens) {
      if (deviceToken.platform === 'apns') {
        try {
          await this.sendAPNS(deviceToken.token, title, body, data);
        } catch (error) {
          this.logger.warn(`APNS send failed for token ${deviceToken.token.slice(0, 8)}...: ${error}`);
          // Remove invalid tokens
          if (this.isInvalidTokenError(error)) {
            await this.deviceTokenRepository.delete({ id: deviceToken.id });
            this.logger.log(`Removed invalid token ${deviceToken.token.slice(0, 8)}...`);
          }
        }
      }
    }
  }

  private async sendAPNS(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<void> {
    const teamId = process.env.APNS_TEAM_ID;
    const keyId = process.env.APNS_KEY_ID;
    const privateKey = process.env.APNS_PRIVATE_KEY;
    const bundleId = process.env.APNS_BUNDLE_ID || 'net.portaljobs.ios';

    if (!teamId || !keyId || !privateKey) {
      this.logger.warn('APNS not configured — skipping push notification');
      return;
    }

    const token = this.generateAPNSToken(teamId, keyId, privateKey);
    const isProduction = process.env.NODE_ENV === 'production';
    const host = isProduction
      ? 'api.push.apple.com'
      : 'api.sandbox.push.apple.com';

    const payload: APNSPayload = {
      aps: {
        alert: { title, body },
        sound: 'default',
        'mutable-content': 1,
      },
      ...data,
    };

    return new Promise((resolve, reject) => {
      const client = http2.connect(`https://${host}`);

      client.on('error', (err) => {
        client.close();
        reject(err);
      });

      const headers = {
        ':method': 'POST',
        ':path': `/3/device/${deviceToken}`,
        authorization: `bearer ${token}`,
        'apns-topic': bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
      };

      const req = client.request(headers);

      let responseData = '';
      let statusCode = 0;

      req.on('response', (headers) => {
        statusCode = headers[':status'] as number;
      });

      req.on('data', (chunk) => {
        responseData += chunk;
      });

      req.on('end', () => {
        client.close();
        if (statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`APNS ${statusCode}: ${responseData}`));
        }
      });

      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  private generateAPNSToken(teamId: string, keyId: string, privateKey: string): string {
    const key = privateKey.replace(/\\n/g, '\n');
    return jwt.sign({}, key, {
      algorithm: 'ES256',
      issuer: teamId,
      header: {
        alg: 'ES256',
        kid: keyId,
      },
      expiresIn: '1h',
    });
  }

  private isInvalidTokenError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('BadDeviceToken') ||
      message.includes('Unregistered') ||
      message.includes('410');
  }
}
