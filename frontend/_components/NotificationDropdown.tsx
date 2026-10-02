"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  MessageSquare,
  CornerUpLeft,
  UserPlus,
  Share2,
  CheckCheck,
  Sparkles,
  Loader2,
  User as UserIcon,
  Circle,
} from "lucide-react";
import {
  useGetNotifications,
  useMarkAllNotificationsAsRead,
  useReadNotification,
  NotificationItem,
  NotificationType,
} from "@/_features/notifications";
import { useLanguage } from "@/context/LanguageContext";
import { formatRelativeTime } from "@/lib/utils";
import Tooltip from "@/_components/Tooltip";
import { Text } from "@/_components/Text";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import { useToggleFollowUser } from "@/_features/user/hooks/useToggleFollowUser";

interface NotificationDropdownProps {
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [followedBackIds, setFollowedBackIds] = useState<Set<string>>(
    () => new Set(),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, isArabic } = useLanguage();

  const { notifications, unreadCount, isLoading } = useGetNotifications();
  const { data: currentUser } = useGetAuthMeQuery();
  const markAllMutation = useMarkAllNotificationsAsRead();
  const readNotificationMutation = useReadNotification();
  const followMutation = useToggleFollowUser();

  const currentFollowingIds = new Set(
    (currentUser?.following || []).map((user) =>
      typeof user === "string" ? user : (user as unknown as { _id: string })._id,
    ),
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filtered notifications
  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((item) => !item.isRead)
      : notifications;

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      readNotificationMutation.mutate(notif._id);
    }

    setIsOpen(false);
    if (onCloseMobileDrawer) onCloseMobileDrawer();

    if (notif.type === "follow" || !notif.post) {
      if (notif.sender?._id) {
        router.push(`/profile/${notif.sender._id}`);
      }
    } else {
      const postId =
        typeof notif.post === "object" && notif.post !== null
          ? (notif.post as any)._id
          : notif.post;
      if (postId) {
        router.push(`/posts/${postId}`);
      } else if (notif.sender?._id) {
        router.push(`/profile/${notif.sender._id}`);
      }
    }
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllMutation.mutate();
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "like":
      case "like_comment":
      case "like_reply":
        return (
          <div className="p-1 rounded-full bg-rose-500/15 text-rose-500 ring-2 ring-bgSecondary">
            <Heart className="h-3 w-3 fill-rose-500" />
          </div>
        );
      case "comment":
        return (
          <div className="p-1 rounded-full bg-blue-500/15 text-blue-500 ring-2 ring-bgSecondary">
            <MessageSquare className="h-3 w-3 fill-blue-500/30" />
          </div>
        );
      case "reply":
        return (
          <div className="p-1 rounded-full bg-amber-500/15 text-amber-500 ring-2 ring-bgSecondary">
            <CornerUpLeft className="h-3 w-3" />
          </div>
        );
      case "follow":
        return (
          <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-500 ring-2 ring-bgSecondary">
            <UserPlus className="h-3 w-3" />
          </div>
        );
      case "share":
        return (
          <div className="p-1 rounded-full bg-purple-500/15 text-purple-500 ring-2 ring-bgSecondary">
            <Share2 className="h-3 w-3" />
          </div>
        );
      default:
        return (
          <div className="p-1 rounded-full bg-primary/15 text-primary ring-2 ring-bgSecondary">
            <Sparkles className="h-3 w-3" />
          </div>
        );
    }
  };

  const getActionText = (type: NotificationType) => {
    switch (type) {
      case "follow":
        return t.nav.notifFollow;
      case "like":
        return t.nav.notifLike;
      case "like_comment":
        return t.nav.notifLikeComment;
      case "like_reply":
        return t.nav.notifLikeReply;
      case "comment":
        return t.nav.notifComment;
      case "reply":
        return t.nav.notifReply;
      case "share":
        return t.nav.notifShare;
      default:
        return "";
    }
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip position="bottom" content={t.nav.notifications}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t.nav.notifications}
          aria-expanded={isOpen}
          className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            isOpen
              ? "bg-primary/15 border-primary/40 text-primary shadow-xs"
              : "bg-bgSecondary/60 hover:bg-bgSecondary border-borderPrimary/40 text-textSecondary hover:text-textPrimary"
          }`}
        >
          <Bell
            className={`h-4 w-4 transition-transform duration-200 ${
              unreadCount > 0 ? "animate-[swing_2s_ease-in-out_infinite]" : ""
            }`}
          />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-xs animate-in zoom-in duration-200 ring-2 ring-bgPrimary">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute ${
            isArabic
              ? "left-0 sm:left-0 sm:right-auto"
              : "right-0 sm:right-0 sm:left-auto"
          } mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-[95vw] rounded-2xl bg-bgSecondary/95 backdrop-blur-2xl border border-borderPrimary/70 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col`}
          style={{ maxHeight: "calc(85vh - 4rem)" }}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-borderPrimary/50 flex items-center justify-between gap-2 bg-bgSecondary/80">
            <div className="flex items-center gap-2">
              <Text as="h3" size="sm" font="bold" color="primary">
                {t.nav.notifications}
              </Text>
              {unreadCount > 0 && (
                <span className="text-[11px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                  {unreadCount} {t.nav.unreadNotifications}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllMutation.isPending}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primaryHover transition-colors cursor-pointer disabled:opacity-50"
                title={t.nav.markAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="text-[11px] hidden sm:inline">
                  {t.nav.markAllAsRead}
                </span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2.5 pb-1 flex items-center gap-2 border-b border-borderPrimary/30 bg-bgPrimary/30">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/60"
              }`}
            >
              {t.nav.allNotifications} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === "unread"
                  ? "bg-primary text-white shadow-xs"
                  : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/60"
              }`}
            >
              <span>{t.nav.unreadNotifications}</span>
              {unreadCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === "unread"
                      ? "bg-white/20 text-white"
                      : "bg-rose-500/15 text-rose-500"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-borderPrimary/30 custom-scrollbar">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center text-textSecondary gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <Text as="p" size="xs" color="secondary">
                  {isArabic
                    ? "جاري تحميل الإشعارات..."
                    : "Loading notifications..."}
                </Text>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bell className="h-6 w-6 opacity-60" />
                </div>
                <div>
                  <Text as="p" size="xs" font="bold" color="primary">
                    {filter === "unread"
                      ? t.nav.noUnreadNotifications
                      : t.nav.noNotifications}
                  </Text>
                  <Text
                    as="p"
                    size="xs"
                    color="secondary"
                    className="text-[11px] mt-0.5"
                  >
                    {isArabic
                      ? "سنخبرك عندما يتفاعل أحدهم معك"
                      : "We'll notify you when someone interacts with you"}
                  </Text>
                </div>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const senderName =
                  notif.sender?.fullName ||
                  notif.sender?.username ||
                  t.nav.user;
                const formattedTime = formatRelativeTime(
                  notif.createdAt,
                  isArabic ? "ar" : "en",
                );

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full p-3 flex items-start gap-3 text-left rtl:text-right transition-all cursor-pointer group ${
                      !notif.isRead
                        ? "bg-primary/5 hover:bg-primary/10 "
                        : "hover:bg-bgPrimary/60 opacity-85 hover:opacity-100"
                    }`}
                  >
                    {/* Avatar with Action Icon Badge */}
                    <div className="relative shrink-0 mt-0.5">
                      {notif.sender?.profilePicture?.url ? (
                        <img
                          src={notif.sender.profilePicture.url}
                          alt={senderName}
                          className="h-10 w-10 rounded-full object-cover border border-borderPrimary group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 rtl:-left-1 rtl:-right-auto">
                        {getTypeIcon(notif.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-textPrimary leading-relaxed">
                          <span className="font-bold text-primary hover:underline">
                            {senderName}
                          </span>{" "}
                          <span className="text-textSecondary">
                            {getActionText(notif.type)}
                          </span>
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-textSecondary/80">
                            {formattedTime}
                          </span>
                          {!notif.isRead && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-full">
                              <Circle className="h-1.5 w-1.5 fill-primary text-primary" />
                              {t.nav.unreadNotifications}
                            </span>
                          )}
                        </div>
                      </div>
                      {notif.type === "follow" && notif.sender?._id && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            const senderId = notif.sender._id;
                            if (
                              currentFollowingIds.has(senderId) ||
                              followedBackIds.has(senderId)
                            ) {
                              setIsOpen(false);
                              onCloseMobileDrawer?.();
                              router.push(`/chat?userId=${senderId}`);
                              return;
                            }
                            followMutation.mutate(senderId, {
                              onSuccess: () =>
                                setFollowedBackIds((current) =>
                                  new Set(current).add(senderId),
                                ),
                            });
                          }}
                          disabled={
                            !currentFollowingIds.has(notif.sender._id) &&
                            !followedBackIds.has(notif.sender._id) &&
                            followMutation.isPending &&
                            followMutation.variables === notif.sender._id
                          }
                          className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-60 ${currentFollowingIds.has(notif.sender._id) || followedBackIds.has(notif.sender._id) ? "bg-bgPrimary text-textPrimary hover:bg-bgPrimary/80" : "bg-primary hover:bg-primaryHover"}`}
                        >
                          {currentFollowingIds.has(notif.sender._id) ||
                          followedBackIds.has(notif.sender._id) ? (
                            <MessageSquare className="h-3 w-3" />
                          ) : (
                            <UserPlus className="h-3 w-3" />
                          )}
                          {currentFollowingIds.has(notif.sender._id) ||
                          followedBackIds.has(notif.sender._id)
                            ? t.nav.message
                            : t.nav.followBack}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
