import { axiosClient } from "@/lib/axiosClient";
import {
  ChatConversation,
  ChatMessage,
  SendMessagePayload,
} from "../types/chat.types";

export const getConversations = async (): Promise<ChatConversation[]> => {
  const res = await axiosClient.get("/chat/conversations");
  return res.data?.data || [];
};

export const getMessages = async (userId: string): Promise<ChatMessage[]> => {
  if (!userId) return [];
  const res = await axiosClient.get(`/chat/${userId}`);
  return res.data?.data || [];
};

export const sendMessage = async ({
  recipientId,
  message,
  image,
}: SendMessagePayload): Promise<ChatMessage> => {
  if (image) {
    const formData = new FormData();
    if (message) formData.append("message", message);
    formData.append("messageImage", image);
    const res = await axiosClient.post(`/chat/send/${recipientId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data;
  }

  const res = await axiosClient.post(`/chat/send/${recipientId}`, {
    message: message || "",
  });
  return res.data?.data;
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  await axiosClient.delete(`/chat/${messageId}`);
};

export const editMessage = async ({
  messageId,
  message,
}: {
  messageId: string;
  message: string;
}): Promise<ChatMessage> => {
  const res = await axiosClient.patch(`/chat/${messageId}`, { message });
  return res.data?.data;
};

export const markAsRead = async (userId: string): Promise<void> => {
  if (!userId) return;
  await axiosClient.patch(`/chat/${userId}/read`);
};

export const reactMessage = async ({
  messageId,
  reactionType,
}: {
  messageId: string;
  reactionType: string;
}): Promise<ChatMessage> => {
  const res = await axiosClient.patch(`/chat/${messageId}/react`, {
    reactionType,
  });
  return res.data?.data;
};

