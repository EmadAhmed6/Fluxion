import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactMessage } from "../api/chat.api";
import { ChatMessage } from "../types/chat.types";
import { appToast as toast } from "@/lib/toast";

export const useReactMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      reactionType,
    }: {
      messageId: string;
      reactionType: string;
    }) => reactMessage({ messageId, reactionType }),
    onSuccess: (updatedMessage: ChatMessage) => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Failed to update reaction."
      );
    },
  });
};
