import { axiosClient } from "@/lib/axiosClient";
import type { Story, StoryGroup, StoryViewer } from "../types/story.types";

export const getStoryTimeline = async (): Promise<StoryGroup[]> => {
  const response = await axiosClient.get("/stories/timeline");
  const groups = response.data?.data;
  return Array.isArray(groups) ? groups : [];
};

export const getUserStories = async (userId: string): Promise<Story[]> => {
  const response = await axiosClient.get(`/stories/user/${userId}`);
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

export const createStory = async (file?: File, title?: string): Promise<Story> => {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (title?.trim()) formData.append("title", title.trim());

  const response = await axiosClient.post("/stories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0,
  });
  return response.data?.data;
};

export const getStoryViewers = async (storyId: string): Promise<StoryViewer[]> => {
  const response = await axiosClient.get(`/stories/${storyId}/viewers`);
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

export const viewStory = async (storyId: string): Promise<Story> => {
  const response = await axiosClient.put(`/stories/${storyId}/view`);
  return response.data?.data;
};

export const reactToStory = async ({
  storyId,
  type,
}: {
  storyId: string;
  type: string;
}): Promise<Story> => {
  const response = await axiosClient.patch(`/stories/${storyId}/react`, { type });
  return response.data?.data;
};

export const replyToStory = async ({
  storyId,
  message,
}: {
  storyId: string;
  message: string;
}): Promise<Story> => {
  const response = await axiosClient.post(`/stories/${storyId}/reply`, {
    message,
  });
  return response.data?.data;
};

export const deleteStory = async (storyId: string): Promise<void> => {
  await axiosClient.delete(`/stories/${storyId}`);
};
