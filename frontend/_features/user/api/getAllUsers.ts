import { axiosClient } from "@/lib/axiosClient";
import { UserProfile } from "../../posts/types/Post";

export interface GetUsersParams {
  search?: string;
  role?: string;
  provider?: string;
  jobTitle?: string;
  pageNumber?: number;
}

export interface GetUsersResponse {
  users: UserProfile[];
  page: number;
  pages: number;
  limit: number;
  totalUsers: number;
}

export const getAllUsers = async (
  params?: GetUsersParams
): Promise<GetUsersResponse> => {
  const cleanParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([_, v]) => v !== undefined && v !== null && v !== ""
        )
      )
    : undefined;

  const response = await axiosClient.get<any>("/users", { params: cleanParams });

  const rawData = response.data?.data || response.data;
  if (Array.isArray(rawData)) {
    return {
      users: rawData,
      page: 1,
      pages: 1,
      limit: rawData.length,
      totalUsers: rawData.length,
    };
  }

  const users = Array.isArray(rawData?.users)
    ? rawData.users
    : Array.isArray(response.data?.users)
    ? response.data.users
    : [];

  return {
    users,
    page: Number(rawData?.page || 1),
    pages: Number(rawData?.pages || 1),
    limit: Number(rawData?.limit || 10),
    totalUsers: Number(rawData?.totalUsers ?? users.length),
  };
};
