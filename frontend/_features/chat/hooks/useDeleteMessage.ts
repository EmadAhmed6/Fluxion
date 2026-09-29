import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMessage } from "../api/chat.api";
import { appToast as toast } from "@/lib/toast";

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      toast.success("Message deleted");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete message.");
    },
  });
};
