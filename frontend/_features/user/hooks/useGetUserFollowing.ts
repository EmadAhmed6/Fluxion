import { useQuery } from "@tanstack/react-query";
import { getUserFollowing } from "../api/getUserFollowing";

export const useGetUserFollowing = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ["userFollowing", userId],
    queryFn: () => getUserFollowing(userId),
    enabled: !!userId && enabled,
  });
};
