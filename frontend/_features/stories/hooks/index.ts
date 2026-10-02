import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { Story } from "../types/story.types";
import { appToast } from "@/lib/toast";
import {
  createStory,
  deleteStory,
  getStoryTimeline,
  getUserStories,
  getStoryViewers,
  reactToStory,
  replyToStory,
  viewStory,
} from "../api/stories.api";

const getStoryErrorMessage = (error: unknown) => {
  const details = error as {
    response?: {
      data?: {
        message?: string;
        data?: { message?: string };
      };
    };
  };
  return details?.response?.data?.data?.message || details?.response?.data?.message;
};

export const useGetStoryTimeline = (enabled = true) => {
  const token = Cookies.get("token");
  return useQuery({
    queryKey: ["stories", "timeline"],
    queryFn: getStoryTimeline,
    enabled: Boolean(token) && enabled,
    staleTime: 30_000,
  });
};

export const useGetUserStories = (userId: string, enabled = true) => {
  const token = Cookies.get("token");
  return useQuery({
    queryKey: ["stories", "user", userId],
    queryFn: () => getUserStories(userId),
    enabled: Boolean(token && userId) && enabled,
    staleTime: 30_000,
  });
};

export const useGetStoryViewers = (storyId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["stories", storyId, "viewers"],
    queryFn: () => getStoryViewers(storyId),
    enabled: Boolean(storyId) && enabled,
  });

export const useCreateStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file?: File; title?: string }) =>
      createStory(file, title),
    onSuccess: () => {
      appToast.success("Story shared successfully!");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      appToast.error(
        getStoryErrorMessage(error) ||
          "Failed to share story.",
      );
    },
  });
};

export const useViewStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: viewStory,
    onSuccess: (updatedStory) => {
      queryClient.setQueryData(
        ["stories", "timeline"],
        (groups: import("../types/story.types").StoryGroup[] | undefined) =>
          groups?.map((group) => ({
            ...group,
            stories: group.stories.map((story) =>
              story._id === updatedStory._id
                ? {
                    ...story,
                    views: updatedStory.views,
                    authorViewed: updatedStory.authorViewed,
                  }
                : story,
            ),
          })),
      );
      queryClient.setQueriesData<Story[]>(
        { queryKey: ["stories", "user"] },
        (stories) =>
          stories?.map((story) =>
            story._id === updatedStory._id
              ? {
                  ...story,
                  views: updatedStory.views,
                  authorViewed: updatedStory.authorViewed,
                }
              : story,
          ),
      );
    },
  });
};

export const useReactToStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactToStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", "timeline"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      appToast.error(
        getStoryErrorMessage(error) ||
          "Failed to react to story.",
      );
    },
  });
};

export const useReplyToStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replyToStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (error: unknown) => {
      appToast.error(
        getStoryErrorMessage(error) || "Failed to reply to story.",
      );
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      appToast.success("Story deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      appToast.error(
        getStoryErrorMessage(error) ||
          "Failed to delete story.",
      );
    },
  });
};
