"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Loader2,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { appToast } from "@/lib/toast";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  useCreateStory,
  useDeleteStory,
  useGetStoryTimeline,
  useGetUserStories,
  useGetStoryViewers,
  useReactToStory,
  useReplyToStory,
  useViewStory,
} from "@/_features/stories/hooks";
import type {
  Story,
  StoryGroup,
  StoryUser,
} from "@/_features/stories/types/story.types";

interface StoriesTrayProps {
  mode?: "timeline" | "profile";
  avatarOnly?: boolean;
  avatarSize?: "small" | "profile";
  profileUser?: StoryUser;
  profileStories?: Story[];
}

const getId = (value: string | { _id: string } | undefined) =>
  typeof value === "string" ? value : value?._id || "";

export default function StoriesTray({
  mode = "timeline",
  avatarOnly = false,
  avatarSize = "small",
  profileUser,
  profileStories,
}: StoriesTrayProps) {
  const { t, isArabic } = useLanguage();
  const router = useRouter();
  const { data: currentUser, isLoading: isAuthLoading } = useGetAuthMeQuery();
  const currentUserId = currentUser?._id || "";
  const { data: timelineGroups = [], isLoading } = useGetStoryTimeline(
    mode === "timeline",
  );
  const { data: fetchedProfileStories = [] } = useGetUserStories(
    profileUser?._id || "",
    mode === "profile",
  );
  const createMutation = useCreateStory();
  const { mutate: markStoryViewed } = useViewStory();
  const reactMutation = useReactToStory();
  const replyMutation = useReplyToStory();
  const deleteMutation = useDeleteStory();

  const profileGroup = useMemo<StoryGroup | null>(() => {
    if (!profileUser) return null;
    const stories = profileStories?.length
      ? profileStories
      : fetchedProfileStories;
    if (!stories.length) return null;
    return { author: profileUser, stories };
  }, [fetchedProfileStories, profileStories, profileUser]);

  const sourceGroups = useMemo(
    () =>
      mode === "profile"
        ? profileGroup
          ? [profileGroup]
          : timelineGroups.filter(
              (group) => group.author._id === profileUser?._id,
            )
        : timelineGroups,
    [mode, profileGroup, profileUser?._id, timelineGroups],
  );
  const ownGroup = useMemo(
    () => sourceGroups.find((group) => group.author._id === currentUserId),
    [currentUserId, sourceGroups],
  );
  const visibleGroups = useMemo(
    () => sourceGroups.filter((group) => group.author._id !== currentUserId),
    [currentUserId, sourceGroups],
  );
  const allGroups = useMemo(
    () => (ownGroup ? [ownGroup, ...visibleGroups] : visibleGroups),
    [ownGroup, visibleGroups],
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [locallyViewedStoryIds, setLocallyViewedStoryIds] = useState<
    Set<string>
  >(() => new Set());
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeGroup = allGroups.find(
    (group) => group.author._id === activeGroupId,
  );
  const activeStoryIndex =
    activeGroup?.stories.findIndex((story) => story._id === activeStoryId) ??
    -1;
  const activeStory =
    activeStoryIndex >= 0 ? activeGroup?.stories[activeStoryIndex] : undefined;
  const activeStoryIdForEffect = activeStory?._id;
  const activeStoryHasVideo = Boolean(activeStory?.fileUrl);
  const isOwnStory = Boolean(
    activeStory && getId(activeStory.author) === currentUserId,
  );
  const hasReactedWithLove = Boolean(
    activeStory?.reactions?.some(
      (reaction) =>
        getId(reaction.user) === currentUserId && reaction.type === "❤️",
    ),
  );
  const [viewersStoryId, setViewersStoryId] = useState<string | null>(null);
  const showViewers = Boolean(
    activeStoryId && viewersStoryId === activeStoryId,
  );
  const { data: storyViewers = [], isLoading: areViewersLoading } =
    useGetStoryViewers(activeStory?._id || "", isOwnStory && showViewers);
  const [loadedVideoDuration, setLoadedVideoDuration] = useState<{
    storyId: string;
    durationMs: number;
  } | null>(null);
  const activeDurationMs = activeStoryHasVideo
    ? loadedVideoDuration &&
      loadedVideoDuration.storyId === activeStoryIdForEffect
      ? loadedVideoDuration.durationMs
      : 15_000
    : 5_000;

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const markLocallyViewed = useCallback((storyId: string) => {
    setLocallyViewedStoryIds((previous) => {
      if (previous.has(storyId)) return previous;
      const next = new Set(previous);
      next.add(storyId);
      return next;
    });
  }, []);

  const closeViewer = useCallback(() => {
    setActiveGroupId(null);
    setActiveStoryId(null);
    setReplyDraft("");
  }, []);

  const advanceStory = useCallback(
    (direction: 1 | -1) => {
      const group = allGroups.find((item) => item.author._id === activeGroupId);
      const storyIndex =
        group?.stories.findIndex((story) => story._id === activeStoryId) ?? -1;
      if (!group || storyIndex < 0) return;
      const nextIndex = storyIndex + direction;
      if (nextIndex < 0 || nextIndex >= group.stories.length) {
        closeViewer();
        return;
      }
      const nextStory = group.stories[nextIndex];
      if (nextStory) {
        if (group.author._id === currentUserId)
          markLocallyViewed(nextStory._id);
        setReplyDraft("");
        setActiveStoryId(nextStory._id);
      }
    },
    [
      activeGroupId,
      activeStoryId,
      allGroups,
      closeViewer,
      currentUserId,
      markLocallyViewed,
    ],
  );

  const advanceStoryRef = useRef(advanceStory);
  useEffect(() => {
    advanceStoryRef.current = advanceStory;
  }, [advanceStory]);

  useEffect(() => {
    if (!activeStoryIdForEffect) return;
    if (isOwnStory) {
      markStoryViewed(activeStoryIdForEffect);
      return;
    }
    markStoryViewed(activeStoryIdForEffect);
  }, [activeStoryIdForEffect, isOwnStory, markStoryViewed]);

  useEffect(() => {
    if (!activeStoryIdForEffect) return;
    const timeout = window.setTimeout(
      () => advanceStoryRef.current(1),
      activeDurationMs + (activeStoryHasVideo ? 750 : 0),
    );
    return () => window.clearTimeout(timeout);
  }, [activeStoryIdForEffect, activeDurationMs, activeStoryHasVideo]);

  useEffect(() => {
    if (!activeStoryIdForEffect) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowRight") advanceStory(isArabic ? -1 : 1);
      if (event.key === "ArrowLeft") advanceStory(isArabic ? 1 : -1);
    };
    document.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [
    activeStoryIdForEffect,
    activeGroupId,
    isArabic,
    advanceStory,
    closeViewer,
  ]);

  const openViewer = (group: StoryGroup, index = 0) => {
    const story = group.stories[index];
    if (!story) return;
    if (group.author._id === currentUserId) {
      markLocallyViewed(story._id);
    }
    setActiveGroupId(group.author._id);
    setActiveStoryId(story._id);
    setReplyDraft("");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      (!file.type.startsWith("image/") && !file.type.startsWith("video/")) ||
      file.size > 100 * 1024 * 1024
    ) {
      appToast.error(t.story.imageOrVideoOnly);
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(file);
    setPreviewUrl(previewUrlRef.current);
    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleCreateStory = () => {
    if (!selectedFile && !caption.trim()) return;
    createMutation.mutate(
      { file: selectedFile || undefined, title: caption },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          clearSelectedFile();
          setCaption("");
        },
      },
    );
  };

  const handleDeleteStory = () => {
    if (!activeStory) return;
    deleteMutation.mutate(activeStory._id, {
      onSuccess: () => {
        const remaining =
          activeGroup?.stories.filter(
            (story) => story._id !== activeStory._id,
          ) || [];
        if (remaining.length === 0) closeViewer();
        else {
          const nextStory = remaining[0];
          if (nextStory && isOwnStory) markLocallyViewed(nextStory._id);
          setReplyDraft("");
          setActiveStoryId(nextStory?._id || null);
        }
      },
    });
  };

  const handleReplyToStory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = replyDraft.trim();
    if (!activeStory || !message || replyMutation.isPending) return;

    replyMutation.mutate(
      { storyId: activeStory._id, message },
      {
        onSuccess: () => {
          setReplyDraft("");
          appToast.success(t.story.storyReplySent);
        },
      },
    );
  };

  const openOwnStories = () => {
    if (ownGroup?.stories.length) openViewer(ownGroup);
    else setIsCreateOpen(true);
  };

  const openProfileStories = (event: React.SyntheticEvent) => {
    if (!profileGroup) return;
    event.preventDefault();
    event.stopPropagation();
    openViewer(profileGroup);
  };

  const profileHasUnseenStories = Boolean(
    profileGroup?.stories.some(
      (story) =>
        !locallyViewedStoryIds.has(story._id) &&
        !story.authorViewed &&
        !story.views?.some((viewer) => getId(viewer) === currentUserId),
    ),
  );

  if (
    (!avatarOnly && !currentUserId && !isAuthLoading) ||
    (mode === "profile" && !profileUser)
  ) {
    return null;
  }

  return (
    <>
      {activeStory && (
        <style>{`@keyframes story-progress-fill { from { width: 0%; } to { width: 100%; } }`}</style>
      )}
      {avatarOnly && profileUser ? (
        <span
          role={profileGroup ? "button" : undefined}
          tabIndex={profileGroup ? 0 : undefined}
          aria-label={profileUser.fullName || profileUser.username}
          onClick={openProfileStories}
          onKeyDown={(event) => {
            if (profileGroup && (event.key === "Enter" || event.key === " ")) {
              openProfileStories(event);
            }
          }}
          className={`flex shrink-0 items-center justify-center rounded-full ${profileGroup ? "cursor-pointer" : ""} ${avatarSize === "profile" ? "h-28 w-28 p-[4px] md:h-32 md:w-32" : "h-12 w-12 p-[3px]"} ${profileGroup ? (profileHasUnseenStories ? "bg-gradient-to-tr from-yellow-400 via-fuchsia-600 to-purple-600" : "bg-neutral-400 dark:bg-neutral-600") : "bg-transparent"}`}
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-bgPrimary bg-bgPrimary text-primary">
            {profileUser.profilePicture?.url ? (
              <img
                src={profileUser.profilePicture.url}
                alt={profileUser.fullName || profileUser.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className={
                  avatarSize === "profile"
                    ? "text-4xl font-bold"
                    : "text-base font-bold"
                }
              >
                {(profileUser.fullName || profileUser.username || "?")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            )}
          </span>
        </span>
      ) : !avatarOnly ? (
        <section className="w-full rounded-2xl border border-borderPrimary/50 bg-bgSecondary/45 px-4 py-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            {mode === "profile" && !sourceGroups.length && (
              <span className="text-xs text-textSecondary">
                {t.story.noStories}
              </span>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {currentUserId &&
              (mode === "timeline" || profileUser?._id === currentUserId) && (
                <div className="relative flex w-[100px] shrink-0 flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={openOwnStories}
                    aria-label={ownGroup ? t.story.yourStory : t.story.addStory}
                    className={`flex h-[92px] w-[92px] cursor-pointer items-center justify-center overflow-hidden rounded-full p-[3px] text-primary ${ownGroup?.stories.some((story) => !story.authorViewed && !locallyViewedStoryIds.has(story._id) && !story.views?.some((viewer) => getId(viewer) === currentUserId)) ? "bg-gradient-to-tr from-yellow-400 via-fuchsia-600 to-purple-600" : "bg-neutral-400 dark:bg-neutral-600"}`}
                  >
                    <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-bgPrimary bg-bgPrimary">
                      {currentUser?.profilePicture?.url ? (
                        <img
                          src={currentUser.profilePicture.url}
                          alt={currentUser.fullName || currentUser.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          {(
                            currentUser?.fullName ||
                            currentUser?.username ||
                            "?"
                          )
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={t.story.addStory}
                    title={t.story.addStory}
                    onClick={() => setIsCreateOpen(true)}
                    className="absolute right-0 top-[58px] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-bgSecondary bg-primary text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="w-full truncate text-center text-[10px] text-textSecondary">
                    {ownGroup ? t.story.yourStory : t.story.addStory}
                  </span>
                </div>
              )}

            {visibleGroups.map((group) => {
              const hasUnseen = group.stories.some(
                (story) =>
                  !story.views?.some(
                    (viewer) => getId(viewer) === currentUserId,
                  ),
              );
              return (
                <button
                  key={group.author._id}
                  type="button"
                  onClick={() => openViewer(group)}
                  className="flex w-[100px] shrink-0 cursor-pointer flex-col items-center gap-1.5"
                >
                  <span
                    className={`flex h-[92px] w-[92px] items-center justify-center rounded-full p-[3px] ${hasUnseen ? "bg-gradient-to-tr from-yellow-400 via-fuchsia-600 to-purple-600" : "bg-neutral-400 dark:bg-neutral-600"}`}
                  >
                    <span className="h-full w-full overflow-hidden rounded-full border-[3px] border-bgPrimary bg-bgPrimary">
                      {group.author.profilePicture?.url ? (
                        <img
                          src={group.author.profilePicture.url}
                          alt={group.author.fullName || group.author.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                          {(group.author.fullName || group.author.username)
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="w-full truncate text-center text-[10px] text-textSecondary">
                    {group.author.username}
                  </span>
                </button>
              );
            })}

            {isLoading && !visibleGroups.length && (
              <div className="flex h-16 w-16 shrink-0 animate-pulse rounded-full bg-bgPrimary" />
            )}
          </div>
        </section>
      ) : null}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsCreateOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-borderPrimary/60 bg-bgPrimary p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-textPrimary">
                {t.story.createStory}
              </h3>
              <button
                type="button"
                aria-label={t.story.close}
                onClick={() => setIsCreateOpen(false)}
                className="cursor-pointer rounded-full p-2 text-textSecondary hover:bg-bgSecondary hover:text-textPrimary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="mb-4 flex max-h-[55vh] min-h-48 items-center justify-center overflow-hidden rounded-xl bg-black">
                {selectedFile?.type.startsWith("video/") ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="max-h-[55vh] max-w-full"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt={t.story.createStory}
                    className="max-h-[55vh] max-w-full object-contain"
                  />
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4 flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-borderPrimary bg-bgSecondary/50 text-sm text-textSecondary hover:border-primary/60 hover:text-primary"
              >
                <Upload className="h-6 w-6" />
                {t.story.chooseMedia}
              </button>
            )}
            {selectedFile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mb-3 cursor-pointer text-xs font-semibold text-primary hover:underline"
              >
                {t.story.chooseMedia}
              </button>
            )}
            <input
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, 250))}
              maxLength={250}
              placeholder={t.story.storyCaption}
              className="mb-4 w-full rounded-xl border border-borderPrimary bg-bgSecondary px-3 py-2.5 text-sm text-textPrimary outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={
                createMutation.isPending || (!selectedFile && !caption.trim())
              }
              onClick={handleCreateStory}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {createMutation.isPending ? t.story.sharing : t.story.shareStory}
            </button>
          </div>
        </div>
      )}

      {activeStory &&
        activeGroup &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-2 sm:p-6"
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeViewer();
            }}
          >
            <div className="relative flex h-[min(92dvh,820px)] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl bg-black shadow-2xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex gap-1 px-3 pt-3">
                {activeGroup.stories.map((story, index) => (
                  <span
                    key={story._id}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/35"
                  >
                    <span
                      key={`${story._id}-${activeStoryIdForEffect}-${activeDurationMs}`}
                      className="block h-full rounded-full bg-white"
                      style={{
                        width: index < activeStoryIndex ? "100%" : "0%",
                        ...(index === activeStoryIndex
                          ? {
                              animation: `story-progress-fill ${activeDurationMs}ms linear forwards`,
                            }
                          : {}),
                      }}
                    />
                  </span>
                ))}
              </div>

              <div className="absolute inset-x-0 top-6 z-20 flex items-center justify-between gap-3 px-3 text-white">
                <button
                  type="button"
                  onClick={() => {
                    const authorId = activeGroup.author._id;
                    closeViewer();
                    router.push(
                      authorId === currentUserId
                        ? "/profile/me"
                        : `/profile/${authorId}`,
                    );
                  }}
                  className="flex min-w-0 cursor-pointer items-center gap-2 text-start"
                >
                  {activeGroup.author.profilePicture?.url ? (
                    <img
                      src={activeGroup.author.profilePicture.url}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold">
                      {(
                        activeGroup.author.fullName ||
                        activeGroup.author.username
                      )
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">
                      {activeGroup.author.fullName ||
                        activeGroup.author.username}
                    </span>
                    <span className="block text-[10px] text-white/70">
                      {new Date(activeStory.createdAt).toLocaleTimeString(
                        isArabic ? "ar-EG" : "en-US",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  {isOwnStory && (
                    <button
                      type="button"
                      aria-label={t.story.deleteStory}
                      title={t.story.deleteStory}
                      disabled={deleteMutation.isPending}
                      onClick={handleDeleteStory}
                      className="cursor-pointer rounded-full p-2 hover:bg-white/15 disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={t.story.close}
                    onClick={closeViewer}
                    className="cursor-pointer rounded-full p-2 hover:bg-white/15"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="relative flex flex-1 items-center justify-center overflow-hidden">
                {activeStory.imageUrl ? (
                  <img
                    src={activeStory.imageUrl}
                    alt={activeStory.title}
                    className="h-full w-full object-contain"
                  />
                ) : activeStory.fileUrl ? (
                  <video
                    src={activeStory.fileUrl}
                    autoPlay
                    playsInline
                    onLoadedMetadata={(event) => {
                      const duration = event.currentTarget.duration;
                      if (Number.isFinite(duration) && duration > 0) {
                        setLoadedVideoDuration({
                          storyId: activeStory._id,
                          durationMs: Math.max(1_000, duration * 1000),
                        });
                      }
                    }}
                    onEnded={() => advanceStory(1)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-black px-8 text-center">
                    <p className="break-words text-2xl font-semibold text-white sm:text-4xl">
                      {activeStory.title}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  aria-label={isArabic ? "القصة السابقة" : "Previous story"}
                  onClick={() => advanceStory(-1)}
                  className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer"
                />
                <button
                  type="button"
                  aria-label={isArabic ? "القصة التالية" : "Next story"}
                  onClick={() => advanceStory(1)}
                  className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer"
                />
                {(activeStory.imageUrl || activeStory.fileUrl) &&
                  activeStory.title &&
                  activeStory.title !== "Story" && (
                    <p className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-black/75 px-6 py-3 text-center text-sm font-medium text-white drop-shadow-lg">
                      {activeStory.title}
                    </p>
                  )}
              </div>

              <div className="z-20 border-t border-white/15 px-4 py-3 text-white">
                <div className="flex items-center justify-between gap-2">
                  {isOwnStory ? (
                    <span className="flex items-center gap-1 text-xs text-white/75">
                      <button
                        type="button"
                        onClick={() =>
                          setViewersStoryId(
                            showViewers ? null : activeStory?._id || null,
                          )
                        }
                        aria-expanded={showViewers}
                        className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4" />
                        {activeStory.views?.filter(
                          (viewer) => getId(viewer) !== currentUserId,
                        ).length || 0}
                      </button>
                    </span>
                  ) : (
                    <form
                      onSubmit={handleReplyToStory}
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      <input
                        aria-label={t.story.replyToStory}
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        placeholder={t.story.replyPlaceholder}
                        className="min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white outline-none placeholder:text-white/60 focus:border-white/60"
                      />
                      <button
                        type="submit"
                        aria-label={t.story.sendReply}
                        title={t.story.sendReply}
                        disabled={!replyDraft.trim() || replyMutation.isPending}
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {replyMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  )}
                  {!isOwnStory && (
                    <button
                      type="button"
                      aria-label={t.story.reactToStory}
                      aria-pressed={hasReactedWithLove}
                      disabled={reactMutation.isPending}
                      onClick={() =>
                        reactMutation.mutate({
                          storyId: activeStory._id,
                          type: "❤️",
                        })
                      }
                      className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50 ${hasReactedWithLove ? "border-rose-400/60 text-rose-500" : "border-white/30 text-white"}`}
                    >
                      <Heart
                        className={`h-4 w-4 ${hasReactedWithLove ? "fill-rose-500 text-rose-500" : ""}`}
                      />
                      {activeStory.reactions?.length || 0}
                    </button>
                  )}
                </div>
                {isOwnStory && showViewers && (
                  <div className="mt-3 max-h-36 overflow-y-auto rounded-xl bg-white/10 p-2">
                    {areViewersLoading ? (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : storyViewers.length ? (
                      <ul className="space-y-2">
                        {storyViewers.map((viewer) => {
                          const reacted = activeStory.reactions?.some(
                            (reaction) => getId(reaction.user) === viewer._id,
                          );
                          return (
                            <li key={viewer._id}>
                              <Link
                                href={
                                  viewer._id === currentUserId
                                    ? "/profile/me"
                                    : `/profile/${viewer._id}`
                                }
                                onClick={() => closeViewer()}
                                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-1 text-xs no-underline hover:bg-white/10 hover:no-underline"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  {viewer.profilePicture?.url ? (
                                    <img
                                      src={viewer.profilePicture.url}
                                      alt=""
                                      className="h-7 w-7 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 font-semibold">
                                      {(viewer.fullName || viewer.username)
                                        .slice(0, 1)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                  <span className="truncate text-white">
                                    {viewer.fullName || viewer.username}
                                  </span>
                                </span>
                                {reacted && (
                                  <Heart
                                    aria-label={
                                      isArabic
                                        ? "تفاعل بالقلب"
                                        : "Reacted with a heart"
                                    }
                                    className="h-4 w-4 shrink-0 fill-rose-500 text-rose-500"
                                  />
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="py-2 text-center text-xs text-white/70">
                        {isArabic ? "لا يوجد مشاهدون بعد" : "No viewers yet"}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => advanceStory(-1)}
                aria-label="Previous"
                className="absolute left-2 top-1/2 z-30 hidden -translate-y-1/2 cursor-pointer rounded-full bg-black/35 p-2 text-white sm:block"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => advanceStory(1)}
                aria-label="Next"
                className="absolute right-2 top-1/2 z-30 hidden -translate-y-1/2 cursor-pointer rounded-full bg-black/35 p-2 text-white sm:block"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
