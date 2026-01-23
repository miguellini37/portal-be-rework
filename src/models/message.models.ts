export interface IGetRecentMessagesResponse {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
}

export interface IGetConversationInput {
  otherUserId: string;
}

export interface IConversationMessage {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
}

export interface IGetConversationResponse {
  messages: IConversationMessage[];
}

export interface ISendMessageInput {
  toUserId: string;
  message: string;
}

export interface ISendMessageResponse {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
}

export interface IMarkMessageReadInput {
  messageId: string;
}

export interface IMarkMessageReadResponse {
  success: boolean;
  readAt: Date;
}

export interface IGetUsersToMessageInput {
  search?: string;
}

export interface IUserToMessage {
  id: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  schoolName?: string;
}

export interface IGetUsersToMessageResponse {
  users: IUserToMessage[];
}

export interface IGetUserForMessagingInput {
  targetUserId: string;
}
