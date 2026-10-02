import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pinMessage } from "../api/chat.api";
import { ChatMessage } from "../types/chat.types";
import { appToast as toast } from "@/lib/toast";

export const usePinMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => pinMessage(messageId),
    onSuccess: (updatedMessage: ChatMessage) => {
      queryClient.setQueriesData<ChatMessage[]>(
        { queryKey: ["chatMessages"] },
        (messages) =>
          messages?.map((message) =>
            message._id === updatedMessage._id
              ? { ...message, ...updatedMessage }
              : message,
          ),
      );
      queryClient.setQueriesData<ChatMessage[]>(
        { queryKey: ["pinnedMessages"] },
        (messages) =>
          messages?.flatMap((message) => {
            if (message._id !== updatedMessage._id) return [message];
            return updatedMessage.isPinned
              ? [{ ...message, ...updatedMessage }]
              : [];
          }),
      );
      queryClient.invalidateQueries({ queryKey: ["pinnedMessages"] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      toast.success(updatedMessage.isPinned ? "Message pinned" : "Message unpinned");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Failed to update pinned message."
      );
    },
  });
};
