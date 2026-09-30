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
  file,
  replyTo,
}: SendMessagePayload): Promise<ChatMessage> => {
  const endpoint = replyTo
    ? `/chat/${recipientId}/${replyTo}/reply`
    : `/chat/${recipientId}/send`;

  if (file) {
    const formData = new FormData();
    if (message) formData.append("message", message);
    formData.append("file", file);
    const res = await axiosClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      // File uploads can take longer than the API client's 10-second default.
      // Keep the request pending until the server finishes saving the message.
      timeout: 0,
    });
    return res.data?.data;
  }

  const res = await axiosClient.post(endpoint, {
    message: message || "",
  });
  return res.data?.data;
};

export const sendAudioMessage = async ({
  recipientId,
  audio,
  replyTo,
}: {
  recipientId: string;
  audio: Blob;
  replyTo?: string;
}): Promise<ChatMessage> => {
  const formData = new FormData();
  const extension = audio.type.includes("mp4")
    ? "mp4"
    : audio.type.includes("ogg")
      ? "ogg"
      : "webm";
  formData.append("audio", audio, `voice-message.${extension}`);
  if (replyTo) formData.append("replyTo", replyTo);

  const res = await axiosClient.post(`/chat/${recipientId}/audio`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0,
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

export const forwardMessage = async ({
  messageId,
  recipientId,
}: {
  messageId: string;
  recipientId: string;
}): Promise<ChatMessage> => {
  const res = await axiosClient.post(
    `/chat/${recipientId}/${messageId}/forward`,
  );
  return res.data?.data;
};
