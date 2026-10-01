"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Ban,
  Briefcase,
  Loader2,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Text } from "@/_components/Text";
import { useLanguage } from "@/context/LanguageContext";
import { useGetBlockedUsers, useUnblockUser } from "@/_features/user/hooks";
import type { FollowUserItem } from "@/_features/user/api/getUserFollowers";

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlockedUsersModal({
  isOpen,
  onClose,
}: BlockedUsersModalProps) {
  const { t, isArabic } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isError, refetch } = useGetBlockedUsers(isOpen);
  const unblockMutation = useUnblockUser();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const visibleUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const users = data?.blockedUsers || [];
    if (!query) return users;
    return users.filter((user) =>
      [user.fullName, user.username, user.jobTitle].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  }, [data?.blockedUsers, searchQuery]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-md bg-bgSecondary border border-borderPrimary/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-5 border-b border-borderPrimary/40 flex items-center justify-between">
          <div>
            <Text as="h3" size="lg" font="bold" color="primary">
              {t.profile.blockedUsers}
            </Text>
            <Text as="p" size="xs" color="secondary" className="text-[11px]">
              {t.profile.blockedUsersModalTitle}
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

        <div className="px-4 py-2.5 border-b border-borderPrimary/30">
          <div className="relative flex items-center">
            <Search className="absolute ltr:left-3 rtl:right-3 h-4 w-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.profile.searchUsers}
              className="w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-2 rounded-xl bg-bgPrimary/70 border border-borderPrimary/50 text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
              <Text as="p" size="sm" color="secondary">
                {t.profile.blockedUsersLoadError}
              </Text>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                {isArabic ? "إعادة المحاولة" : "Retry"}
              </Button>
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                {searchQuery ? (
                  <Search className="h-6 w-6" />
                ) : (
                  <Ban className="h-6 w-6" />
                )}
              </div>
              <Text as="p" size="sm" font="bold" color="primary">
                {searchQuery ? t.profile.noUsersFound : t.profile.noBlockedUsers}
              </Text>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleUsers.map((user) => (
                <BlockedUserRow
                  key={user._id}
                  user={user}
                  isPending={unblockMutation.isPending}
                  onUnblock={() => unblockMutation.mutate(user._id)}
                  onUserClick={onClose}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

function BlockedUserRow({
  user,
  isPending,
  onUnblock,
  onUserClick,
}: {
  user: FollowUserItem;
  isPending: boolean;
  onUnblock: () => void;
  onUserClick: () => void;
}) {
  const { t } = useLanguage();
  const displayName = user.fullName || user.username || "User";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.85,
        height: 0,
        overflow: "hidden",
        padding: 0,
      }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-bgPrimary/60 border border-transparent hover:border-borderPrimary/40 transition-colors group cursor-pointer"
    >
      <Link
        href={`/profile/${user._id}`}
        onClick={onUserClick}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
      >
        {user.profilePicture?.url ? (
          <img
            src={user.profilePicture.url}
            alt={displayName}
            className="h-11 w-11 rounded-full object-cover border border-primary/25"
          />
        ) : (
          <div className="h-11 w-11 rounded-full bg-primary/15 text-primary flex items-center justify-center border border-primary/20">
            <UserIcon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Text
            as="p"
            size="sm"
            font="bold"
            color="primary"
            className="truncate group-hover:text-primary"
          >
            {displayName}
          </Text>
          <Text
            as="p"
            size="xs"
            color="secondary"
            className="truncate text-[11px]"
          >
            @{user.username}
          </Text>
          {user.jobTitle && (
            <div className="flex items-center gap-1 mt-0.5">
              <Briefcase className="h-3 w-3 text-primary/70 shrink-0" />
              <Text
                as="span"
                size="xs"
                color="secondary"
                className="truncate text-[10px]"
              >
                {user.jobTitle}
              </Text>
            </div>
          )}
        </div>
      </Link>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={onUnblock}
        className="h-8 px-3 rounded-xl text-xs font-semibold text-amber-500 border-amber-500/30 hover:bg-amber-500/10 shrink-0 cursor-pointer"
      >
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t.profile.unblockUser}
      </Button>
    </motion.div>
  );
}
