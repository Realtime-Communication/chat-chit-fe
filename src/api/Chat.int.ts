import { Account } from "../components/store/accountContext";

export enum MessageType {
  text = "TEXT",
  image = "IMAGE",
  file = "FILE",
  video = "VIDEO",
  call = "CALL",
}

export enum CallStatus {
  INVITED = "INVITED",
  MISSED = "MISSED",
  ONGOING = "ONGOING",
  ENDED = "ENDED",
}

export enum CallType {
  voice = "VOICE",
  video = "VIDEO",
}

export enum MessageStatus {
  sent,
  delivered,
  read,
}

export enum ParticipantType {
  lead,
  member,
}

export enum FriendStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
}

export enum ConversationType {
  GROUP = 0,
  FRIEND = 1,
}

export interface ConversationParticipant {
  id: number;
  userId: number;
  type: ParticipantType;
  createdAt: Date;
  user: User;
}

export interface ConversationVm {
  id: number;
  title: string;
  creatorId: number;
  channelId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  conversationType : ConversationType;
  participants?: ConversationParticipant[];
}

// Message response types
export interface User {
  id: number;
  sid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isActive: boolean;
}

export interface Attachment {
  thumbUrl: string;
  fileUrl: string;
}

export interface MessageResponse {
  statusCode: number;
  message: string;
  data: {
    page: number;
    result: MessageDto[];
    size: number;
    totalPage: number;
    totalElement: number;
  };
}

export interface MessageDto {
  id?: number;
  conversationId: number | undefined;
  guid?: number;
  conversationType?: ConversationType;
  messageType: MessageType;
  content: string;
  callType?: CallType;
  callStatus?: CallStatus;
  status?: MessageStatus; // You can default this in your implementation logic
  timestamp?: Date;
  attachments?: Attachment[];
  user?: Account;
}

export interface CallDto extends Partial<MessageDto> {
  callerInfomation?: Account;
  signal: string;
  conversation?: ConversationVm;
}

export interface CallResponseDto extends Partial<MessageDto> {
  signal: string;
  callerInfomation: Account;
  conversation: ConversationVm;
}

export interface OtherInfo {
  name: string;
  image: string;
  type: ConversationType;
  participants?: ConversationParticipant[];
}