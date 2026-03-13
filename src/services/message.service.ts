import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { USER_PERMISSIONS } from '../constants/user-permissions';
import {
  IGetRecentMessagesResponse,
  IGetConversationInput,
  IGetConversationResponse,
  ISendMessageInput,
  ISendMessageResponse,
  IMarkMessageReadInput,
  IMarkMessageReadResponse,
  IGetUsersToMessageInput,
  IGetUsersToMessageResponse,
  IGetUserForMessagingInput,
  IUserToMessage,
} from '../models/message.models';
import { MessagingGateway } from '../gateways/messaging.gateway';
import { PushNotificationService } from './push-notification.service';

interface ILatestMessageResult {
  conversationId: string;
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  createdAt: Date;
  unreadCount: string;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => MessagingGateway))
    private messagingGateway: MessagingGateway,
    private pushNotificationService: PushNotificationService
  ) {}

  /**
   * Get the 10 latest messages from the 10 conversations with the most recent message
   * where the TO or FROM user id is the current user's id
   */
  async getRecentMessages(userId: string): Promise<IGetRecentMessagesResponse[]> {
    // Get the latest message for each conversation with a single efficient query
    const latestMessagesQuery = `
      SELECT 
        m1.conversationId,
        m1.id,
        m1.fromUserId,
        m1.toUserId,
        m1.message,
        m1.createdAt,
        (SELECT COUNT(*) 
         FROM message m2 
         WHERE m2.conversationId = m1.conversationId 
           AND m2.toUserId = ? 
           AND m2.readAt IS NULL
        ) as unreadCount
      FROM message m1
      WHERE (m1.fromUserId = ? OR m1.toUserId = ?)
        AND m1.createdAt = (
          SELECT MAX(m3.createdAt)
          FROM message m3
          WHERE m3.conversationId = m1.conversationId
        )
      ORDER BY m1.createdAt DESC
      LIMIT 10
    `;

    const latestMessages: ILatestMessageResult[] = await this.messageRepository.query(
      latestMessagesQuery,
      [userId, userId, userId]
    );

    if (latestMessages.length === 0) {
      return [];
    }

    // Get all other user IDs in one query
    const otherUserIds = latestMessages.map((m) =>
      m.fromUserId === userId ? m.toUserId : m.fromUserId
    );

    const uniqueOtherUserIds = [...new Set(otherUserIds)];

    // Fetch all users in a single query
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids: uniqueOtherUserIds })
      .getMany();

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Build the response
    return latestMessages.map((m) => {
      const otherUserId = m.fromUserId === userId ? m.toUserId : m.fromUserId;
      const otherUser = userMap.get(otherUserId);

      return {
        conversationId: m.conversationId,
        otherUserId,
        otherUserName: otherUser
          ? `${otherUser.firstName ?? ''} ${otherUser.lastName ?? ''}`.trim() ||
            otherUser.email ||
            'Unknown User'
          : 'Unknown User',
        lastMessage: m.message,
        lastMessageDate: m.createdAt,
        unreadCount: parseInt(m.unreadCount, 10),
      };
    });
  }

  /**
   * Get all messages between two users
   */
  async getConversation(
    userId: string,
    input: IGetConversationInput
  ): Promise<IGetConversationResponse> {
    const { otherUserId } = input;

    // Generate conversation ID (sorted to ensure consistency)
    const conversationId = this.generateConversationId(userId, otherUserId);

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    // Verify that the current user is part of this conversation
    if (messages.length > 0) {
      const isParticipant = messages.some((m) => m.fromUserId === userId || m.toUserId === userId);
      if (!isParticipant) {
        throw new UnauthorizedException('You are not authorized to view this conversation');
      }
    }

    console.log('Fetched messages:', JSON.stringify(messages));

    return {
      messages: messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        fromUserId: m.fromUserId,
        toUserId: m.toUserId,
        message: m.message,
        readAt: m.readAt,
        createdAt: m.createdAt,
      })),
    };
  }

  /**
   * Send a message
   */
  async sendMessage(userId: string, input: ISendMessageInput): Promise<ISendMessageResponse> {
    const { toUserId, message } = input;

    // Verify that the recipient exists
    const recipient = await this.userRepository.findOne({ where: { id: toUserId } });
    if (!recipient) {
      throw new Error('Recipient user not found');
    }

    // Generate conversation ID (sorted to ensure consistency)
    const conversationId = this.generateConversationId(userId, toUserId);

    const newMessage = this.messageRepository.create({
      conversationId,
      fromUserId: userId,
      toUserId,
      message,
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    const response: ISendMessageResponse = {
      id: savedMessage.id,
      conversationId: savedMessage.conversationId,
      fromUserId: savedMessage.fromUserId,
      toUserId: savedMessage.toUserId,
      message: savedMessage.message,
      readAt: savedMessage.readAt,
      createdAt: savedMessage.createdAt,
    };

    // Emit WebSocket event to the recipient
    if (this.messagingGateway) {
      this.messagingGateway.emitMessageToUser(toUserId, response);
    }

    // Send push notification to recipient
    const sender = await this.userRepository.findOne({ where: { id: userId } });
    const senderName = sender
      ? `${sender.firstName ?? ''} ${sender.lastName ?? ''}`.trim() || 'Someone'
      : 'Someone';
    this.pushNotificationService
      .sendPushToUser(toUserId, senderName, message, {
        type: 'message',
        conversationId,
        fromUserId: userId,
      })
      .catch(() => {});

    return response;
  }

  /**
   * Mark a message as read
   */
  async markMessageRead(
    userId: string,
    input: IMarkMessageReadInput
  ): Promise<IMarkMessageReadResponse> {
    const { messageId } = input;

    const message = await this.messageRepository.findOne({ where: { id: messageId } });

    if (!message) {
      throw new Error('Message not found');
    }

    // Verify that the current user is the recipient
    if (message.toUserId !== userId) {
      throw new UnauthorizedException('You can only mark your own messages as read');
    }

    // If already read, return the existing readAt date
    if (message.readAt) {
      return {
        success: true,
        readAt: message.readAt,
      };
    }

    message.readAt = new Date();
    await this.messageRepository.save(message);

    return {
      success: true,
      readAt: message.readAt,
    };
  }

  /**
   * Get list of users that a person can message
   * Criteria:
   * - All users can see admins
   * - Students see all company users, and any student or school employee in their school
   * - School Employees see all company users, and any student or school employee in their school
   * - Company Employees see all student or school employee users, and any company employee in their company
   */
  async getUsersToMessage(
    userId: string,
    userPermission: string,
    userSchoolId: string | undefined,
    userCompanyId: string | undefined,
    input: IGetUsersToMessageInput
  ): Promise<IGetUsersToMessageResponse> {
    const { search } = input;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.school', 'school')
      .leftJoin('user.company', 'company')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.permission',
        'school.schoolName',
        'company.companyName',
      ])
      .where('user.id != :userId', { userId });

    // Apply search filter if provided
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName LIKE :search OR user.lastName LIKE :search OR CONCAT(user.firstName, " ", user.lastName) LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Build the permission-based filters
    const conditions: string[] = [];

    // All users can see admins
    conditions.push(`user.permission = '${USER_PERMISSIONS.ADMIN}'`);

    if (userPermission === USER_PERMISSIONS.ATHLETE) {
      // Students see all company users
      conditions.push(`user.permission = '${USER_PERMISSIONS.COMPANY}'`);

      // Students see any student or school employee in their school
      if (userSchoolId) {
        conditions.push(
          `((user.permission = '${USER_PERMISSIONS.ATHLETE}' OR user.permission = '${USER_PERMISSIONS.SCHOOL}') AND user.schoolId = :userSchoolId)`
        );
      }
    } else if (userPermission === USER_PERMISSIONS.SCHOOL) {
      // School employees see all company users
      conditions.push(`user.permission = '${USER_PERMISSIONS.COMPANY}'`);

      // School employees see any student or school employee in their school
      if (userSchoolId) {
        conditions.push(
          `((user.permission = '${USER_PERMISSIONS.ATHLETE}' OR user.permission = '${USER_PERMISSIONS.SCHOOL}') AND user.schoolId = :userSchoolId)`
        );
      }
    } else if (userPermission === USER_PERMISSIONS.COMPANY) {
      // Company employees see all student or school employee users
      conditions.push(
        `(user.permission = '${USER_PERMISSIONS.ATHLETE}' OR user.permission = '${USER_PERMISSIONS.SCHOOL}')`
      );

      // Company employees see any company employee in their company
      if (userCompanyId) {
        conditions.push(
          `(user.permission = '${USER_PERMISSIONS.COMPANY}' AND user.companyId = :userCompanyId)`
        );
      }
    } else if (userPermission === USER_PERMISSIONS.ADMIN) {
      // Admins can see everyone (no additional filter needed)
      conditions.push('1=1');
    }

    // Combine all conditions with OR
    if (conditions.length > 0) {
      queryBuilder.andWhere(`(${conditions.join(' OR ')})`, {
        userSchoolId,
        userCompanyId,
      });
    }

    // Order by name
    queryBuilder.orderBy('user.firstName', 'ASC').addOrderBy('user.lastName', 'ASC').take(10);

    const users = await queryBuilder.getMany();

    return {
      users: users.map((user) => {
        const userWithRelations = user as User & {
          company?: { companyName?: string };
          school?: { schoolName?: string };
        };
        return {
          id: user.id,
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          companyName: userWithRelations.company?.companyName,
          schoolName: userWithRelations.school?.schoolName,
        };
      }),
    };
  }

  /**
   * Get a specific user that the current user can message
   * Uses the same permission rules as getUsersToMessage
   */
  async getUserForMessaging(
    userId: string,
    userPermission: string,
    userSchoolId: string | undefined,
    userCompanyId: string | undefined,
    input: IGetUserForMessagingInput
  ): Promise<IUserToMessage | null> {
    const { targetUserId } = input;

    // Can't message yourself
    if (targetUserId === userId) {
      return null;
    }

    // Fetch the target user with relations
    const user = await this.userRepository.findOne({
      where: { id: targetUserId },
      relations: ['school', 'company'],
    });

    if (!user) {
      return null;
    }

    // Check permissions in TypeScript
    let hasPermission = false;

    const userWithRelations = user as User & {
      schoolId?: string;
      companyId?: string;
      company?: { companyName?: string };
      school?: { schoolName?: string };
    };

    // All users can see admins
    if (user.permission === USER_PERMISSIONS.ADMIN) {
      hasPermission = true;
    }
    // Admins can see everyone
    else if (userPermission === USER_PERMISSIONS.ADMIN) {
      hasPermission = true;
    }
    // Students see all company users, and any student or school employee in their school
    else if (userPermission === USER_PERMISSIONS.ATHLETE) {
      if (user.permission === USER_PERMISSIONS.COMPANY) {
        hasPermission = true;
      } else if (
        (user.permission === USER_PERMISSIONS.ATHLETE ||
          user.permission === USER_PERMISSIONS.SCHOOL) &&
        userSchoolId &&
        userWithRelations.schoolId === userSchoolId
      ) {
        hasPermission = true;
      }
    }
    // School employees see all company users, and any student or school employee in their school
    else if (userPermission === USER_PERMISSIONS.SCHOOL) {
      if (user.permission === USER_PERMISSIONS.COMPANY) {
        hasPermission = true;
      } else if (
        (user.permission === USER_PERMISSIONS.ATHLETE ||
          user.permission === USER_PERMISSIONS.SCHOOL) &&
        userSchoolId &&
        userWithRelations.schoolId === userSchoolId
      ) {
        hasPermission = true;
      }
    }
    // Company employees see all student or school employee users, and any company employee in their company
    else if (userPermission === USER_PERMISSIONS.COMPANY) {
      if (
        user.permission === USER_PERMISSIONS.ATHLETE ||
        user.permission === USER_PERMISSIONS.SCHOOL
      ) {
        hasPermission = true;
      } else if (
        user.permission === USER_PERMISSIONS.COMPANY &&
        userCompanyId &&
        userWithRelations.companyId === userCompanyId
      ) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      companyName: userWithRelations.company?.companyName,
      schoolName: userWithRelations.school?.schoolName,
    };
  }

  /**
   * Generate a consistent conversation ID for two users
   */
  private generateConversationId(userId1: string, userId2: string): string {
    // Sort the IDs to ensure the same conversation ID regardless of order
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }
}
