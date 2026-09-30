import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appToast as toast } from "@/lib/toast";
import { forwardMessage } from "../api/chat.api";

export const useForwardMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: forwardMessage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chatMessages", variables.recipientId],
      });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to forward message.");
    },
  });
};
