import { useQuery } from "@tanstack/react-query";
import { getAllUsers, GetUsersParams } from "../api/getAllUsers";

export const useGetAllUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getAllUsers(params),
  });
};
