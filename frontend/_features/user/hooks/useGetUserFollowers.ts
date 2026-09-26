import { useQuery } from "@tanstack/react-query";
import { getUserFollowers } from "../api/getUserFollowers";

export const useGetUserFollowers = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ["userFollowers", userId],
    queryFn: () => getUserFollowers(userId),
    enabled: !!userId && enabled,
  });
};
