import { IsString, IsOptional, IsUUID } from 'class-validator';

export class ICreateMessageInput {
  @IsUUID()
  toUserId!: string;

  @IsString()
  message!: string;
}

export class IMessageQueryInput {
  @IsOptional()
  @IsString()
  conversationWith?: string;
}