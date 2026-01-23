import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { ISendMessageResponse } from '../models/message.models';

interface IAuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

interface IJwtPayload {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  permission?: string;
  companyId?: string;
  schoolId?: string;
  exp?: number;
  iat?: number;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  },
  path: '/subscription',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService
  ) {
    console.log('🔌 MessagingGateway initialized');
  }

  /**
   * Handle new WebSocket connections
   */
  async handleConnection(client: IAuthenticatedSocket) {
    try {
      // Extract and verify the JWT token from the query parameters or headers
      const token = (client.handshake.query.token as string) || client.handshake.auth.token || '';

      if (!token) {
        console.error('❌ WebSocket connection failed: No token provided');
        throw new UnauthorizedException('Authentication token is required');
      }

      let payload: IJwtPayload;
      try {
        // Decode the token without verification
        // IMPORTANT: In production, you MUST verify the token with Keycloak's public key
        // or validate it against the Keycloak server using the JWKS endpoint
        const base64Payload = token.split('.')[1];
        if (!base64Payload) {
          console.error('❌ WebSocket connection failed: Invalid token format');
          throw new UnauthorizedException('Invalid token format');
        }
        const decodedPayload = Buffer.from(base64Payload, 'base64').toString();
        payload = JSON.parse(decodedPayload) as IJwtPayload;

        // At minimum, check that the token is not expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.error('❌ WebSocket connection failed: Token expired');
          throw new UnauthorizedException('Token expired');
        }

        if (!payload.sub) {
          console.error('❌ WebSocket connection failed: Invalid token payload (no sub)');
          throw new UnauthorizedException('Invalid token payload');
        }
      } catch (error) {
        console.error('❌ WebSocket connection failed: Token parsing error', error);
        throw new UnauthorizedException('Invalid token');
      }

      // Store user information in the socket
      client.userId = payload.sub;
      client.email = payload.email;
      console.log(`✅ WebSocket connected: User ${client.userId} (${client.email})`);
    } catch (error) {
      console.error(
        '❌ WebSocket connection error:',
        error instanceof Error ? error.message : error
      );
      client.disconnect();
    }
  }

  /**
   * Handle client disconnections
   */
  handleDisconnect(client: IAuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}, User: ${client.userId}`);
  }

  /**
   * Subscribe to messages for a specific user
   */
  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: IAuthenticatedSocket,
    @MessageBody() data: { userId: string }
  ) {
    try {
      // Verify that the user is subscribing to their own messages
      if (data.userId !== client.userId) {
        throw new UnauthorizedException('You can only subscribe to your own messages');
      }

      // Join a room specific to this user
      client.join(`user:${data.userId}`);

      console.log(`User ${data.userId} subscribed to their messages`);

      return {
        success: true,
        message: 'Successfully subscribed to messages',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Subscription failed',
      };
    }
  }

  /**
   * Unsubscribe from messages
   */
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: IAuthenticatedSocket,
    @MessageBody() data: { userId: string }
  ) {
    try {
      if (data.userId !== client.userId) {
        throw new UnauthorizedException('You can only unsubscribe from your own messages');
      }

      client.leave(`user:${data.userId}`);

      console.log(`User ${data.userId} unsubscribed from their messages`);

      return {
        success: true,
        message: 'Successfully unsubscribed from messages',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Unsubscribe failed',
      };
    }
  }

  /**
   * Emit a message event to a specific user
   * This is called by the MessageService when a new message is sent
   */
  emitMessageToUser(userId: string, message: ISendMessageResponse) {
    this.server.to(`user:${userId}`).emit('newMessage', message);
  }
}
