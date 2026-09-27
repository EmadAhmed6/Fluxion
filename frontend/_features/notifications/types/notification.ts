export type NotificationType =
  | "follow"
  | "comment"
  | "like"
  | "share"
  | "reply"
  | "like_comment"
  | "like_reply";

export interface NotificationSender {
  _id: string;
  fullName: string;
  username: string;
  profilePicture?: {
    url?: string;
    publicId?: string;
  };
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender: NotificationSender;
  type: NotificationType;
  post?: string;
  comment?: string;
  reply?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
}
