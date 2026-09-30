import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast as toast } from "@/lib/toast";
import { sendAudioMessage } from "../api/chat.api";
import { ChatMessage } from "../types/chat.types";

export const useSendAudioMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendAudioMessage,
    onSuccess: (data: ChatMessage, variables) => {
      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", variables.recipientId],
        (messages = []) =>
          messages.some((message) => message._id === data._id)
            ? messages
            : [...messages, data],
      );
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.recipientId],
      });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send audio message.");
    },
  });
};
