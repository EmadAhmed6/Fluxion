import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unblockUser } from "../api/unblockUser";
import { toast } from "@/lib/toast";

export const useUnblockUser = (defaultTargetUserId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (overrideTargetUserId?: string) => {
      const idToUnblock = overrideTargetUserId || defaultTargetUserId;
      if (!idToUnblock) {
        throw new Error("Target user ID is required to unblock");
      }
      return unblockUser(idToUnblock);
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
        "Failed to unblock user";
      toast.error(message);
    },
  });
};
