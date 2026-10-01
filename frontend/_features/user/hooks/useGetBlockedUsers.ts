import { useQuery } from "@tanstack/react-query";
import { getBlockedUsers } from "../api/getBlockedUsers";

export const useGetBlockedUsers = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["blockedUsers"],
    queryFn: getBlockedUsers,
    enabled,
  });
};
