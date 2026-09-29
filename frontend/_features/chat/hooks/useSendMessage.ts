import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "../api/chat.api";
import { SendMessagePayload, ChatMessage } from "../types/chat.types";
import { appToast as toast } from "@/lib/toast";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendMessage(payload),
    onSuccess: (data: ChatMessage, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.recipientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chatConversations"],
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send message.");
    },
  });
};
