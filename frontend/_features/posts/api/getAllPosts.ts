import { axiosClient } from "@/lib/axiosClient";
import { Post } from "../types/Post";

export interface GetPostsParams {
  page?: number;
  pageNumber?: number;
  search?: string;
  category?: string;
  userId?: string;
}

export interface GetPostsResponse {
  posts: Post[];
  page: number;
  limit: number;
  totalPosts: number;
  totalPages: number;
}

export const getAllPosts = async (
  params?: GetPostsParams
): Promise<GetPostsResponse> => {
  const queryParams: Record<string, any> = {};
  const pNum = params?.pageNumber || params?.page || 1;
  queryParams.pageNumber = pNum;

  if (params?.category && params.category !== "All") {
    queryParams.category = params.category;
  }
  if (params?.search) {
    queryParams.search = params.search;
  }
  if (params?.userId) {
    queryParams.userId = params.userId;
  }

  const response = await axiosClient.get<any>("/posts", { params: queryParams });

  const rawData = response.data?.data || response.data;
  if (Array.isArray(rawData)) {
    return {
      posts: rawData,
      page: 1,
      limit: rawData.length,
      totalPosts: rawData.length,
      totalPages: 1,
    };
  }

  const posts = Array.isArray(rawData?.posts)
    ? rawData.posts
    : Array.isArray(response.data?.posts)
    ? response.data.posts
    : [];

  return {
    posts,
    page: Number(rawData?.page || 1),
    limit: Number(rawData?.limit || 5),
    totalPosts: Number(rawData?.totalPosts ?? posts.length),
    totalPages: Number(rawData?.totalPages || 1),
  };
};
