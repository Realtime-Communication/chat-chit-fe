export enum ConversationType {
  GROUP = 0,
  FRIEND = 1,
}

export interface Participant {
  id: number;
  name?: string;
  userId: number;
  type: string;
}

export interface Message {
  senderId: number;
  content: string;
  createdAt: string;
}

export interface IConversation {
  id: number;
  name: string;
  image: string;
  msgTime: string;
  content: string;
  conversationType: ConversationType;
  participants: Participant[];
}

export interface FriendRequest {
  id: number;
  requester_id: number;
  receiver_id: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  created_at: string;
  requester: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FriendRequestResponse {
  page: number;
  size: number;
  totalPage: number;
  totalElement: number;
  result: FriendRequest[];
}

export interface FriendRequestData {
  id: number;
  requesterId: number;
  receiverId: number;
  status: string;
  createdAt: string;
  requester: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
  };
}

export interface FriendRequestApiResponse {
  statusCode: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalPage: number;
    totalElement: number;
    result: FriendRequestData[];
  };
}

export interface CreateConversationResponse {
  id: number;
  title: string;
  creator_id: number;
  channel_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  avatar_url: string;
  participants: {
    id: number;
    conversation_id: number;
    user_id: number;
    type: "LEAD" | "MEMBER";
    created_at: string;
    updated_at: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      isActive: boolean;
    };
  }[];
}

export interface AddParticipantResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    conversation_id: number;
    user_id: number;
    type: "LEAD" | "MEMBER";
    created_at: string;
    updated_at: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      isActive: boolean;
    };
  };
}

export interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface FriendResponse {
  page: number;
  size: number;
  totalPage: number;
  totalElement: number;
  result: Friend[];
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
}

export interface FriendAP {
  id: number;
  requester_id: number;
  receiver_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requester: User;
  receiver: User;
}

export interface AddParticipantProps {
  conversationId: number;
  onParticipantAdded: () => void;
  onClose: () => void;
}
