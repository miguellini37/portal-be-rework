import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/Message';
import { User } from '../../entities/User';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ICreateMessageInput, IMessageQueryInput } from '../../models/message.models';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get('/')
  async getMessages(@Request() req: any, @Query() query: IMessageQueryInput) {
    const userId = req.user?.id;

    try {
      const queryBuilder = this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.fromUser', 'fromUser')
        .leftJoinAndSelect('message.toUser', 'toUser')
        .where('fromUser.id = :userId OR toUser.id = :userId', { userId })
        .orderBy('message.createdDate', 'DESC');

      if (query.conversationWith) {
        queryBuilder.andWhere(
          '(fromUser.id = :conversationWith AND toUser.id = :userId) OR (fromUser.id = :userId AND toUser.id = :conversationWith)',
          { conversationWith: query.conversationWith, userId }
        );
      }

      return await queryBuilder.getMany();
    } catch (error) {
      throw new Error('Could not fetch messages');
    }
  }

  @Post('/')
  async createMessage(@Request() req: any, @Body() createMessageDto: ICreateMessageInput) {
    const fromUserId = req.user?.id;
    const { toUserId, message } = createMessageDto;

    try {
      const fromUser = await this.userRepository.findOneBy({ id: fromUserId });
      const toUser = await this.userRepository.findOneBy({ id: toUserId });

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      const newMessage = this.messageRepository.create({
        fromUser,
        toUser,
        message,
      });

      await this.messageRepository.save(newMessage);
      return { message: 'Message sent successfully' };
    } catch (error) {
      throw new Error('Failed to send message');
    }
  }
}