import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editMessage } from "../api/chat.api";
import { appToast as toast } from "@/lib/toast";

export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      message,
    }: {
      messageId: string;
      message: string;
    }) => editMessage({ messageId, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      toast.success("Message updated");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          "Failed to edit message."
      );
    },
  });
};
