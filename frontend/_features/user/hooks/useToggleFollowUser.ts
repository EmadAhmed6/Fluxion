import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollowUser } from "../api/toggleFollowUser";
import { toast } from "@/lib/toast";

export const useToggleFollowUser = (defaultTargetUserId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (overrideTargetUserId?: string) => {
      const idToToggle = overrideTargetUserId || defaultTargetUserId;
      if (!idToToggle) {
        throw new Error("Target user ID is required to toggle follow");
      }
      return toggleFollowUser(idToToggle);
    },
    onSuccess: (data) => {
      // Invalidate all related queries across the application to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
      queryClient.invalidateQueries({ queryKey: ["userFollowers"] });
      queryClient.invalidateQueries({ queryKey: ["userFollowing"] });
      if (data?.data?.message) {
        toast.success(data.data.message);
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.data?.message ||
        error?.response?.data?.message ||
        "Failed to update follow status";
      toast.error(message);
    },
  });
};
