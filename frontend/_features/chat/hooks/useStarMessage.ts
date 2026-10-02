import { useMutation, useQueryClient } from "@tanstack/react-query";
import { starMessage } from "../api/chat.api";
import { ChatMessage } from "../types/chat.types";
import { appToast as toast } from "@/lib/toast";

export const useStarMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => starMessage(messageId),
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
        { queryKey: ["starredMessages"] },
        (messages) =>
          messages?.flatMap((message) => {
            if (message._id !== updatedMessage._id) return [message];
            return updatedMessage.isStarred
              ? [{ ...message, ...updatedMessage }]
              : [];
          }),
      );
      queryClient.invalidateQueries({ queryKey: ["starredMessages"] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      toast.success(updatedMessage.isStarred ? "Message starred" : "Message unstarred");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Failed to update starred message."
      );
    },
  });
};
