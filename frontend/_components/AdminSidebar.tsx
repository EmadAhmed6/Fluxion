"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, Crown, ShieldAlert, Loader2 } from "lucide-react";
import { Text } from "@/_components/Text";
import { UserProfile } from "@/_features/posts/types/Post";
import { useGetAllUsers } from "@/_features/user/hooks";
import { useLanguage } from "@/context/LanguageContext";
import { toggleAdminStatus } from "@/_features/user/api/toggleAdminStatus";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import Tooltip from "@/_components/Tooltip";

interface AdminSidebarProps {
  currentUser?: UserProfile | null;
  totalUsers?: number;
  totalPosts?: number;
}

export default function AdminSidebar({
  currentUser,
  totalUsers = 0,
  totalPosts = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { t, isArabic } = useLanguage();
  const { data: users } = useGetAllUsers();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isUsersActive =
    pathname === "/admin/dashboard/users" || pathname === "/admin/dashboard";
  const isPostsActive = pathname === "/admin/dashboard/posts";

  const rawUsersList = Array.isArray(users) ? users : users?.users || [];
  const allUsersList = rawUsersList.map((u) => {
    const isCurrent =
      currentUser &&
      (u._id === currentUser._id ||
        u._id === (currentUser as any).id ||
        (currentUser.username &&
          u.username?.toLowerCase() === currentUser.username?.toLowerCase()));
    return {
      ...u,
      isSuperAdmin: isCurrent
        ? Boolean(currentUser?.role === "SuperAdmin" || u.role === "SuperAdmin")
        : Boolean(u.role === "SuperAdmin"),
      isAdmin: isCurrent
        ? Boolean(currentUser?.role === "Admin" || u.role === "Admin" || currentUser?.role === "SuperAdmin")
        : Boolean(u.role === "Admin"),
    };
  });

  const adminUsers = allUsersList
    .filter((u) => u.isAdmin || u.isSuperAdmin)
    .sort((a, b) => {
      if (a.isSuperAdmin && !b.isSuperAdmin) return -1;
      if (!a.isSuperAdmin && b.isSuperAdmin) return 1;
      return 0;
    });

  const displayAdmins =
    adminUsers.length > 0
      ? adminUsers
      : currentUser &&
          (currentUser.role === "Admin" || currentUser.role === "SuperAdmin")
        ? [currentUser]
        : [];

  const handleRemoveAdmin = async (
    e: React.MouseEvent,
    userId: string,
    username: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setUpdatingId(userId);
    try {
      const res = await toggleAdminStatus(userId);
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
      toast.success(
        isArabic
          ? `اترجع ${username} يوزر عادي`
          : `${username} removed from admin.`,
      );
    } catch (err: any) {
      toast.error(
        isArabic
          ? "حصل خطأ أثناء تعديل الصلاحية"
          : "Failed to update user role.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <aside className="bg-bgSecondary/60 border border-borderPrimary/50 rounded-2xl p-4 shadow-sm backdrop-blur-xs">
      <Text
        as="p"
        size="xs"
        font="bold"
        color="secondary"
        className="uppercase tracking-wider px-3 mb-3"
      >
        {t.admin.navMenu}
      </Text>

      <nav className="flex flex-col gap-1.5">
        {/* Users Route Link */}
        <Link
          href="/admin/dashboard/users"
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
            isUsersActive
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/90"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4" />
            <Text
              as="span"
              size="xs"
              font="semiBold"
              color={isUsersActive ? "white" : "primary"}
            >
              {t.admin.usersManagement}
            </Text>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isUsersActive
                ? "bg-white/20 text-white"
                : "bg-borderPrimary/40 text-textSecondary"
            }`}
          >
            {totalUsers}
          </span>
        </Link>

        {/* Posts Route Link */}
        <Link
          href="/admin/dashboard/posts"
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
            isPostsActive
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/90"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="h-4 w-4" />
            <Text
              as="span"
              size="xs"
              font="semiBold"
              color={isPostsActive ? "white" : "primary"}
            >
              {t.admin.postsManagement}
            </Text>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isPostsActive
                ? "bg-white/20 text-white"
                : "bg-borderPrimary/40 text-textSecondary"
            }`}
          >
            {totalPosts}
          </span>
        </Link>
      </nav>

      {/* Administrators List Section */}
      {displayAdmins.length > 0 && (
        <div className="mt-6 pt-4 border-t border-borderPrimary/40 space-y-2">
          <Text
            as="p"
            size="xs"
            font="semiBold"
            color="secondary"
            className="uppercase tracking-wider px-3 text-[10px] opacity-70 mb-1"
          >
            {isArabic ? "الأدمنز المسجلين" : "Administrators"}
          </Text>

          <div className="space-y-1">
            {displayAdmins.map((adminItem) => {
              const isOwner = Boolean(
                adminItem.role === "SuperAdmin" ||
                  (currentUser &&
                    currentUser.role === "SuperAdmin" &&
                    (currentUser._id === adminItem._id ||
                      (currentUser as any).id === adminItem._id ||
                      (currentUser.username &&
                        currentUser.username?.toLowerCase() === adminItem.username?.toLowerCase())))
              );
              const isLoading = updatingId === adminItem._id;

              return (
                <div
                  key={adminItem._id}
                  className="px-3 py-2 flex items-center justify-between gap-2 hover:bg-bgSecondary/90 rounded-xl transition-all group"
                >
                  {/* Left: avatar + info */}
                  <Link
                    href={`/profile/${adminItem._id}`}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  >
                    {adminItem.profilePicture?.url ? (
                      <img
                        src={adminItem.profilePicture.url}
                        alt={adminItem.username}
                        className="h-8 w-8 rounded-xl object-cover border border-borderPrimary group-hover:border-primary transition-colors shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                        {adminItem.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <Text
                        as="p"
                        size="xs"
                        font="bold"
                        color="primary"
                        className="truncate group-hover:text-primary transition-colors leading-tight"
                      >
                        {adminItem.username}
                      </Text>
                      {isOwner ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5 flex items-center gap-1 text-amber-400">
                          <Crown className="h-2.5 w-2.5 text-amber-400 shrink-0" />
                          {t.profile.owner}
                        </span>
                      ) : (
                        <Text
                          as="span"
                          size="xs"
                          font="semiBold"
                          className="text-[9px] text-amber-500 uppercase block tracking-wider mt-0.5"
                        >
                          {t.admin.adminBadge}
                        </Text>
                      )}
                    </div>
                  </Link>

                  {/* Right: Remove Admin button - only visible to superAdmin, hidden for owner */}
                  {currentUser?.role === "SuperAdmin" && !isOwner && adminItem._id && (
                    <Tooltip
                      position="top"
                      content={t.admin.removeAdmin}
                    >
                      <button
                        onClick={(e) =>
                          handleRemoveAdmin(
                            e,
                            adminItem._id!,
                            adminItem.username || "",
                          )
                        }
                        disabled={isLoading}
                        className="shrink-0 p-1.5 rounded-lg text-rose-500 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                      </button>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
