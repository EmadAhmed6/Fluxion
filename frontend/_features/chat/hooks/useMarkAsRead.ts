import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsRead } from "../api/chat.api";

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => markAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
    },
  });
};
