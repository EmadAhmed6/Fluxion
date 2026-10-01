import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser } from "../api/blockUser";
import { toast } from "@/lib/toast";

export const useBlockUser = (defaultTargetUserId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (overrideTargetUserId?: string) => {
      const idToBlock = overrideTargetUserId || defaultTargetUserId;
      if (!idToBlock) {
        throw new Error("Target user ID is required to block");
      }
      return blockUser(idToBlock);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userFollowers"] });
      queryClient.invalidateQueries({ queryKey: ["userFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["chatConversations"] });
      if (data?.data?.message) {
        toast.success(data.data.message);
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Failed to block user";
      toast.error(message);
    },
  });
};
