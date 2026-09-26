"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Search,
  Users,
  UserCheck,
  UserPlus,
  Loader2,
  Briefcase,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Text } from "@/_components/Text";
import { useLanguage } from "@/context/LanguageContext";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  useGetUserFollowers,
  useGetUserFollowing,
  useToggleFollowUser,
} from "@/_features/user/hooks";
import { FollowUserItem } from "@/_features/user/api/getUserFollowers";

export type FollowModalTab = "followers" | "following";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: FollowModalTab;
  userName?: string;
  onFollowingRemoved?: (unfollowedUserId: string) => void;
}

function FollowUserRow({
  user,
  currentUserId,
  isFollowing,
  onFollowToggle,
  onUserClick,
}: {
  user: FollowUserItem;
  currentUserId?: string;
  isFollowing: boolean;
  onFollowToggle: (wasFollowing: boolean) => void;
  onUserClick: () => void;
}) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(false);
  const isSelf = currentUserId === user._id;

  const toggleMutation = useToggleFollowUser();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleMutation.isPending) return;

    // Trigger instant optimistic update in parent modal
    onFollowToggle(isFollowing);

    // Run mutation with user._id
    toggleMutation.mutate(user._id);
  };

  const displayName = user.fullName || user.username || "User";

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-bgPrimary/60 border border-transparent hover:border-borderPrimary/40 transition-all duration-200 group">
      <Link
        href={`/profile/${user._id}`}
        onClick={onUserClick}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
      >
        <div className="relative shrink-0">
          {user.profilePicture?.url ? (
            <img
              src={user.profilePicture.url}
              alt={displayName}
              className="h-11 w-11 rounded-full object-cover border border-primary/25 shadow-sm group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shadow-sm group-hover:bg-primary/25 transition-colors">
              <UserIcon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Text
              as="span"
              size="sm"
              font="bold"
              color="primary"
              className="truncate group-hover:text-primary transition-colors"
            >
              {displayName}
            </Text>
          </div>

          <Text as="p" size="xs" color="secondary" className="truncate text-[11px] font-medium">
            @{user.username}
          </Text>

          {user.jobTitle && (
            <div className="flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 text-primary/70 shrink-0" />
              <Text as="span" size="xs" color="secondary" className="truncate text-[10px]">
                {user.jobTitle}
              </Text>
            </div>
          )}
        </div>
      </Link>

      {/* Follow / Unfollow Button for this user (hidden if self or not logged in) */}
      {currentUserId && !isSelf && (
        <Button
          type="button"
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          onClick={handleFollowToggle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={toggleMutation.isPending}
          className={`h-8 px-3 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-all duration-200 shadow-sm ${
            isFollowing
              ? hovered
                ? "border-rose-500/50 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                : "border-borderPrimary/60 bg-bgPrimary/80 text-textSecondary hover:bg-bgPrimary"
              : "bg-primary hover:bg-primaryHover text-white shadow-primary/20"
          }`}
        >
          {toggleMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isFollowing ? (
            hovered ? (
              <span className="flex items-center gap-1 text-[11px]">
                <X className="h-3.5 w-3.5" />
                {t.profile.unfollow}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px]">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                {t.profile.followingStatus}
              </span>
            )
          ) : (
            <span className="flex items-center gap-1 text-[11px]">
              <UserPlus className="h-3.5 w-3.5" />
              {t.profile.follow}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}

export default function FollowersModal({
  isOpen,
  onClose,
  userId,
  initialTab = "followers",
  userName,
  onFollowingRemoved,
}: FollowersModalProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<FollowModalTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [removedUserIds, setRemovedUserIds] = useState<Set<string>>(new Set());
  const [followingCountDelta, setFollowingCountDelta] = useState(0);

  const { data: currentUser } = useGetAuthMeQuery();
  const currentUserId = currentUser?._id;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
      setRemovedUserIds(new Set());
      setFollowingCountDelta(0);
    }
  }, [isOpen, initialTab, userId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Queries for followers and following lists
  const {
    data: followersData,
    isLoading: isFollowersLoading,
  } = useGetUserFollowers(userId, isOpen && activeTab === "followers");

  const {
    data: followingData,
    isLoading: isFollowingLoading,
  } = useGetUserFollowing(userId, isOpen && activeTab === "following");

  // Query for current user's following list
  const { data: myFollowingData } = useGetUserFollowing(
    currentUserId || "",
    isOpen && !!currentUserId
  );

  // Set of IDs the current user is following
  const [localFollowingIds, setLocalFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentUser || myFollowingData) {
      const idsFromAuth = (currentUser as any)?.following || [];
      const idsFromQuery = myFollowingData?.following?.map((u) => u._id) || [];
      setLocalFollowingIds(new Set([...idsFromAuth, ...idsFromQuery]));
    }
  }, [currentUser, myFollowingData]);

  const currentList =
    activeTab === "followers"
      ? followersData?.followers || []
      : followingData?.following || [];

  const isLoading =
    activeTab === "followers" ? isFollowersLoading : isFollowingLoading;

  const followersCount = followersData?.followersCount ?? currentList.length;
  const followingCount = Math.max(
    0,
    (followingData?.followingCount ?? currentList.length) + followingCountDelta
  );

  // Instant handler when follow or unfollow is clicked in a row
  const handleFollowToggle = (targetUser: FollowUserItem, wasFollowing: boolean) => {
    if (wasFollowing) {
      // Unfollowed this user:
      // 1. Immediately remove from local following set
      setLocalFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser._id);
        return next;
      });

      // 2. If we are on following tab, immediately remove from modal list!
      // (Also if viewing following list on any profile or own profile)
      setRemovedUserIds((prev) => new Set([...prev, targetUser._id]));
      setFollowingCountDelta((prev) => prev - 1);

      // 3. Notify parent page so it can also decrement following count if needed
      onFollowingRemoved?.(targetUser._id);
    } else {
      // Followed this user:
      // 1. Immediately add to local following set
      setLocalFollowingIds((prev) => new Set([...prev, targetUser._id]));

      // 2. Remove from removedUserIds if it was previously removed
      setRemovedUserIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser._id);
        return next;
      });

      setFollowingCountDelta((prev) => prev + 1);
    }
  };

  // Filtered by search query and excluding removed users
  const visibleList = useMemo(() => {
    let list = currentList;
    if (removedUserIds.size > 0) {
      list = list.filter((u) => !removedUserIds.has(u._id));
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q) ||
        u.jobTitle?.toLowerCase().includes(q)
    );
  }, [currentList, searchQuery, removedUserIds]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-md bg-bgSecondary border border-borderPrimary/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-borderPrimary/40 flex items-center justify-between relative z-10">
          <div>
            <Text as="h3" size="lg" font="bold" color="primary">
              {userName ? `${userName}` : t.profile.userProfile}
            </Text>
            <Text as="p" size="xs" color="secondary" className="text-[11px]">
              {activeTab === "followers"
                ? t.profile.followersModalTitle
                : t.profile.followingModalTitle}
            </Text>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs: Followers vs Following */}
        <div className="p-3 pb-2 border-b border-borderPrimary/30 bg-bgPrimary/30">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-bgPrimary/80 border border-borderPrimary/40 relative">
            <button
              type="button"
              onClick={() => {
                setActiveTab("followers");
                setSearchQuery("");
              }}
              className={`relative py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "followers"
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{t.profile.followers}</span>
              {followersData && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === "followers"
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {followersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("following");
                setSearchQuery("");
              }}
              className={`relative py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "following"
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>{t.profile.following}</span>
              {followingData && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === "following"
                      ? "bg-white/20 text-white"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {followingCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2.5 border-b border-borderPrimary/30">
          <div className="relative flex items-center">
            <Search className="absolute ltr:left-3 rtl:right-3 h-4 w-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.profile.searchUsers}
              className="w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-2 rounded-xl bg-bgPrimary/70 border border-borderPrimary/50 text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute ltr:right-2.5 rtl:left-2.5 p-1 rounded-md text-textSecondary hover:text-textPrimary cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* User List Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-borderPrimary/20">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-11 w-11 rounded-full bg-borderPrimary/40 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-borderPrimary/40 rounded w-1/3" />
                    <div className="h-2.5 bg-borderPrimary/30 rounded w-1/4" />
                  </div>
                  <div className="h-8 w-18 rounded-xl bg-borderPrimary/30 shrink-0" />
                </div>
              ))}
            </div>
          ) : visibleList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                {activeTab === "followers" ? (
                  <Users className="h-6 w-6 text-primary" />
                ) : (
                  <UserCheck className="h-6 w-6 text-primary" />
                )}
              </div>
              <Text as="p" size="sm" font="bold" color="primary" className="mb-1">
                {searchQuery
                  ? t.profile.noUsersFound
                  : activeTab === "followers"
                  ? t.profile.noFollowers
                  : t.profile.noFollowing}
              </Text>
              {searchQuery && (
                <Text as="p" size="xs" color="secondary">
                  "{searchQuery}"
                </Text>
              )}
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleList.map((user) => (
                <motion.div
                  key={user._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.85,
                    height: 0,
                    overflow: "hidden",
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    borderWidth: 0,
                  }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  <FollowUserRow
                    user={user}
                    currentUserId={currentUserId}
                    isFollowing={localFollowingIds.has(user._id)}
                    onFollowToggle={(wasFollowing) => handleFollowToggle(user, wasFollowing)}
                    onUserClick={onClose}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
