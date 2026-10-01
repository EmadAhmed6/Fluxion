import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../api/getUserById";

export const useGetUserProfile = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId && enabled,
    retry: (failureCount, error: any) =>
      error?.response?.status === 403 ? false : failureCount < 2,
  });
};
