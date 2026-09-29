"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Edit,
  Crown,
  MessageSquare,
} from "lucide-react";

import Tooltip, { TooltipPosition } from "./Tooltip";
import { Text } from "./Text";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import { toggleAdminStatus } from "@/_features/user/api/toggleAdminStatus";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import EditProfileModal from "./EditProfileModal";
import { useLanguage } from "@/context/LanguageContext";

interface UserHoverCardProps {
  user?: {
    _id?: string;
    fullName?: string;
    username?: string;
    jobTitle?: string;
    bio?: string;
    email?: string;
    role?: "User" | "Admin" | "SuperAdmin";
    profilePicture?: {
      url?: string;
    };
  };
  position?: TooltipPosition;
  children: React.ReactNode;
}

export default function UserHoverCard({
  user,
  position = "bottom",
  children,
}: UserHoverCardProps) {
  const { data: currentUser } = useGetAuthMeQuery();
  const { t, isArabic } = useLanguage();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user || !user._id) return <>{children}</>;

  const displayName = user.fullName || user.username || "User";
  const formattedUsername = user.username
    ? user.username.startsWith("@")
      ? user.username
      : `@${user.username}`
    : null;

  const handleToggleAdmin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?._id) return;
    setIsUpdating(true);
    const newStatus = user.role !== "Admin";
    try {
      const res = await toggleAdminStatus(user._id);
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", user._id] });
      if (user._id === currentUser?._id) {
        queryClient.invalidateQueries({ queryKey: ["authMe"] });
      }
      toast.success(
        isArabic
          ? newStatus
            ? `اتعمل ${displayName} أدمن`
            : `اترجع ${displayName} يوزر عادي`
          : newStatus
            ? "Promoted to Admin!"
            : "Removed from Admin!",
      );
    } catch (err: any) {
      toast.error(
        isArabic
          ? "حصل خطأ أثناء تعديل الصلاحية"
          : "Failed to update user role.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const content = (
    <div className="p-3 max-w-xs space-y-2.5 min-w-44 text-left">
      <Link
        href={`/profile/${user._id}`}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-2.5 group/cardhead cursor-pointer hover:opacity-90 transition-opacity"
      >
        {user.profilePicture?.url ? (
          <img
            src={user.profilePicture.url}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover border border-borderPrimary shrink-0 group-hover/cardhead:scale-105 transition-transform"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 font-bold text-xs group-hover/cardhead:scale-105 transition-transform">
            <UserIcon className="h-4 w-4" />
          </div>
        )}
        <div className="overflow-hidden min-w-0 flex-1">
          <Text
            as="h4"
            size="xs"
            font="bold"
            color="primary"
            className="truncate leading-tight group-hover/cardhead:underline"
          >
            {displayName}
          </Text>
          {formattedUsername && (
            <Text
              as="p"
              size="xs"
              color="secondary"
              className="truncate leading-tight text-[10px] text-textSecondary mt-0.5 font-medium"
            >
              {formattedUsername}
            </Text>
          )}
          {user.role === "SuperAdmin" ? (
            <span className="text-[9px] font-extrabold uppercase tracking-wider  mt-0.5 text-amber-400 flex items-center gap-1">
              <Crown className="h-2.5 w-2.5 text-amber-400 inline" />
              {t.profile.owner}
            </span>
          ) : user.role === "Admin" ? (
            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block mt-0.5">
              {t.admin.admin}
            </span>
          ) : null}
        </div>
      </Link>

      {/* Toggle Admin: visible only to superAdmin, not on superAdmin targets */}
      {currentUser?.role === "SuperAdmin" && user.role !== "SuperAdmin" && (
        <div className="pt-2 border-t border-borderPrimary/20">
          <button
            type="button"
            onClick={handleToggleAdmin}
            disabled={isUpdating}
            className="w-full text-[10px] font-bold py-1.5 px-2.5 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : user.role === "Admin" ? (
              <>
                <ShieldAlert className="h-3 w-3" />
                <span>{t.profile.removeAdmin}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3" />
                <span>{t.profile.setAdmin}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Edit User: visible to admins (with restriction on superAdmin targets unless currentUser is superAdmin) */}
      {(currentUser?.role === "SuperAdmin" || (currentUser?.role === "Admin" && user.role !== "SuperAdmin")) && (
        <div className="pt-2 border-t border-borderPrimary/20">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="w-full text-[10px] font-bold py-1.5 px-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Edit className="h-3 w-3" />
            <span>{t.profile.editUser}</span>
          </button>
        </div>
      )}

      <div className="pt-1.5 flex items-center justify-between border-t border-borderPrimary/20">
        {currentUser?._id !== user._id && (
          <Link
            href={`/chat?userId=${user._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            <MessageSquare className="h-3 w-3" />
            <span>{t.chat.directMessage}</span>
          </Link>
        )}
        <Link
          href={`/profile/${user._id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-textSecondary hover:text-primary transition-colors cursor-pointer"
        >
          <span>{t.profile.viewProfile}</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

    </div>
  );

  return (
    <>
      <Tooltip position={position} content={content}>
        {children}
      </Tooltip>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          targetUserId={user._id}
        />
      )}
    </>
  );
}
