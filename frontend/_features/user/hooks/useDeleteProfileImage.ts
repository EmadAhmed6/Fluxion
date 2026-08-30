import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProfileImage } from "../api/deleteProfileImage";
import { toast } from "@/lib/toast";

export const useDeleteProfileImage = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProfileImage(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Profile picture deleted!");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.data?.message ||
          "Failed to delete profile picture.",
      );
    },
  });
};
