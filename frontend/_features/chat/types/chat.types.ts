export interface ChatUser {
  _id: string;
  username: string;
  fullName?: string;
  profilePicture?: {
    url?: string;
    publicId?: string;
  };
  role?: string;
  jobTitle?: string;
  bio?: string;
}


export interface ChatReaction {
  user: ChatUser | string;
  type: "like" | "love" | "care" | "haha" | "wow" | "sad" | "angry" | "eggs" | string;
}

export interface ChatMessage {
  _id: string;
  sender: ChatUser | string;
  recipient: ChatUser | string;
  message: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
  isDeleted: boolean;
  isRead: boolean;
  isEdited?: boolean;
  isForwarded?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  reactions?: ChatReaction[];
  replyTo?: ChatMessage | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  user: ChatUser;
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface SendMessagePayload {
  recipientId: string;
  message?: string;
  file?: File | null;
  replyTo?: string;
}
