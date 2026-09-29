"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import Navbar from "@/_components/Navbar";

import PostCard from "@/_components/PostCard";
import CreatePostCard from "@/_components/CreatePostCard";
import EditProfileModal from "@/_components/EditProfileModal";
import {
  useGetUserProfile,
  useUploadProfilePicture,
  useDeleteProfileImage,
  useDeleteUser,
  useToggleFollowUser,
} from "@/_features/user/hooks";
import { useGetPosts } from "@/_features/posts/hooks";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  User as UserIcon,
  Mail,
  Loader2,
  FileText,
  Edit,
  Edit2,
  Trash2,
  ShieldCheck,
  Calendar,
  Briefcase,
  Eye,
  Crown,
  KeyRound,
  MoreVertical,
  Users,
  UserCheck,
  UserPlus,
  X,
  MessageSquare,
} from "lucide-react";
import ImageModal from "@/_components/ImageModal";
import DeleteConfirmModal from "@/_components/DeleteConfirmModal";
import ChangePasswordModal from "@/_components/ChangePasswordModal";
import FollowersModal, { FollowModalTab } from "@/_components/FollowersModal";
import { Button } from "@/components/ui/button";
import { Text } from "@/_components/Text";
import { Post } from "@/_features/posts/types/Post";

import { useLanguage } from "@/context/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const routeUserId = params.id as string;
  const { t, isArabic } = useLanguage();

  const { data: currentUser } = useGetAuthMeQuery();
  console.log(currentUser);

  const targetUserId =
    routeUserId === "me" ? currentUser?._id || "" : routeUserId;

  const isOwnProfile =
    routeUserId === "me" ||
    (currentUser && String(currentUser._id) === String(targetUserId));

  const { data: profileUser, isLoading: isUserLoading } =
    useGetUserProfile(targetUserId);
  const { data: userPosts, isLoading: isPostsLoading } = useGetPosts({
    userId: targetUserId,
  });

  const uploadProfileMutation = useUploadProfilePicture(targetUserId);
  const deleteProfileImageMutation = useDeleteProfileImage(targetUserId);
  const deleteUserMutation = useDeleteUser();
  const toggleFollowMutation = useToggleFollowUser(targetUserId);

  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isDeletePhotoModalOpen, setIsDeletePhotoModalOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] =
    useState<FollowModalTab>("followers");
  const [isFollowHovered, setIsFollowHovered] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false);
      }
    }
    if (isAvatarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAvatarMenuOpen]);

  const userToDisplay =
    profileUser || (isOwnProfile ? currentUser : null) || currentUser;

  // Optimistic follow state and count deltas for instant real-time UI updates
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState<
    boolean | null
  >(null);
  const [followersCountDelta, setFollowersCountDelta] = useState<number>(0);
  const [followingCountDelta, setFollowingCountDelta] = useState<number>(0);

  // Sync / reset optimistic state when viewing another user or when profileUser changes
  useEffect(() => {
    setIsFollowingOptimistic(null);
    setFollowersCountDelta(0);
    setFollowingCountDelta(0);
  }, [targetUserId, profileUser?._id]);

  const baseFollowersCount = (userToDisplay as any)?.followers?.length || 0;
  const baseFollowingCount = (userToDisplay as any)?.following?.length || 0;

  const followersCount = Math.max(0, baseFollowersCount + followersCountDelta);
  const followingCount = Math.max(0, baseFollowingCount + followingCountDelta);

  const baseIsFollowing = Boolean(
    currentUser &&
    targetUserId &&
    !isOwnProfile &&
    ((userToDisplay as any)?.followers?.some(
      (f: any) =>
        String(typeof f === "string" ? f : f?._id || f?.id) ===
        String(currentUser._id),
    ) ||
      (currentUser as any)?.following?.some(
        (f: any) =>
          String(typeof f === "string" ? f : f?._id || f?.id) ===
          String(targetUserId),
      )),
  );

  const isFollowing =
    isFollowingOptimistic !== null ? isFollowingOptimistic : baseIsFollowing;

  const handleOpenFollowModal = (tab: FollowModalTab) => {
    setFollowModalTab(tab);
    setIsFollowersModalOpen(true);
  };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      router.push("/auth/login");
      return;
    }
    if (toggleFollowMutation.isPending) return;

    const willFollow = !isFollowing;

    // 1. Instantly update UI in 0 milliseconds
    setIsFollowingOptimistic(willFollow);
    setFollowersCountDelta((prev) => prev + (willFollow ? 1 : -1));

    // 2. Perform server mutation
    toggleFollowMutation.mutate(targetUserId, {
      onError: () => {
        // Rollback optimistic update on failure
        setIsFollowingOptimistic(null);
        setFollowersCountDelta(0);
      },
      onSettled: () => {
        setIsFollowingOptimistic(null);
        setFollowersCountDelta(0);
      },
    });
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await deleteProfileImageMutation.mutateAsync();
      setIsDeletePhotoModalOpen(false);
    } catch {
      // error handled in mutation toast
    }
  };

  const handleDeleteAccount = async () => {
    const deleteId = targetUserId || currentUser?._id;
    if (!deleteId) return;
    try {
      await deleteUserMutation.mutateAsync(deleteId);
      setIsDeleteUserModalOpen(false);
      if (isOwnProfile) {
        Cookies.remove("token", { path: "/" });
        Cookies.remove("token");
        router.push("/auth/login");
      } else {
        router.push("/");
      }
    } catch {
      // error handled in mutation
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await uploadProfileMutation.mutateAsync(file);
      } finally {
        setIsUploading(false);
        e.target.value = ""; // Reset file input value to allow re-upload of the same file
      }
    }
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const fetchedUserPosts = Array.isArray(userPosts)
    ? userPosts
    : userPosts?.posts || [];
  const rawPosts: any[] =
    fetchedUserPosts.length > 0
      ? fetchedUserPosts
      : Array.isArray((userToDisplay as any)?.posts)
        ? (userToDisplay as any).posts
        : [];

  const displayUserPosts = rawPosts.filter((post: any) => {
    if (!targetUserId) return true;
    const pUserId =
      typeof post.user === "string"
        ? post.user
        : post.user?._id || post.user?.id;
    if (!pUserId) return true;
    return String(pUserId) === String(targetUserId);
  });

  const joinedDateFormatted = userToDisplay?.createdAt
    ? new Date(userToDisplay.createdAt).toLocaleDateString(
        isArabic ? "ar-EG" : "en-US",
        { month: "short", day: "numeric", year: "numeric" },
      )
    : "";

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* User Hero Header Card */}
        <div className="relative rounded-3xl bg-bgSecondary/60 border border-borderPrimary/50 p-6 md:p-10 mb-10 overflow-hidden shadow-xl">
          <div className="absolute top-0 ltr:right-0 rtl:left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          {isUserLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
              {/* Avatar Section */}
              <div className="relative shrink-0 group">
                <div
                  onClick={() => {
                    if (userToDisplay?.profilePicture?.url) {
                      setPreviewImage(userToDisplay.profilePicture.url);
                    }
                  }}
                  className={`relative ${userToDisplay?.profilePicture?.url ? "cursor-pointer" : ""}`}
                  title={
                    userToDisplay?.profilePicture?.url
                      ? isArabic
                        ? "اضغط لتكبير الصورة"
                        : "Click to view photo"
                      : undefined
                  }
                >
                  {userToDisplay?.profilePicture?.url ? (
                    <div className="relative rounded-full overflow-hidden">
                      <img
                        src={userToDisplay.profilePicture.url}
                        alt={userToDisplay.fullName || userToDisplay.username}
                        className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover border-2 border-primary/30 shadow-md group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white pointer-events-none z-10">
                        <Eye className="h-6 w-6 text-white mb-0.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {isArabic ? "عرض الصورة" : "View Image"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-primary/15 flex items-center justify-center text-primary border-2 border-primary/30 shadow-md">
                      <UserIcon className="h-14 w-14" />
                    </div>
                  )}
                </div>

                {/* Avatar Action Buttons (Owner or Admin — but not admin on SuperAdmin profile) */}
                {(isOwnProfile ||
                  currentUser?.role === "SuperAdmin" ||
                  (currentUser?.role === "Admin" &&
                    userToDisplay?.role !== "SuperAdmin")) && (
                  <div
                    className="absolute -bottom-1 ltr:-right-1 rtl:-left-1 z-20"
                    ref={avatarMenuRef}
                  >
                    {userToDisplay?.profilePicture?.url ? (
                      // If there is a photo, show a "More" dropdown menu containing Edit & Delete
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAvatarMenuOpen((prev) => !prev);
                          }}
                          className="p-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white shadow-lg border-2 border-bgSecondary transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                          title={isArabic ? "خيارات الصورة" : "Photo Options"}
                        >
                          <MoreVertical className="h-4 w-4 text-white" />
                        </button>

                        <AnimatePresence>
                          {isAvatarMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 4 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className={`absolute ${
                                isArabic ? "left-0" : "right-0"
                              } bottom-full mb-2 w-40 rounded-xl bg-bgSecondary border border-borderPrimary/60 shadow-2xl z-30 p-1.5 space-y-0.5`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Edit / Change option */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAvatarMenuOpen(false);
                                  fileInputRef.current?.click();
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-textPrimary hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-start"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>{t.profile.changePhoto}</span>
                              </button>

                              {/* Delete option */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAvatarMenuOpen(false);
                                  setIsDeletePhotoModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-start"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                <span>{t.profile.deletePhoto}</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      // If there is no photo, show the regular edit / upload pen button directly
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="p-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white shadow-lg border-2 border-bgSecondary transition-transform hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                        title={t.profile.changePhoto}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Edit2 className="h-4 w-4 text-white" />
                        )}
                      </button>
                    )}

                    {/* Hidden File Input used for uploading/updating the avatar */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={
                        isUploading || deleteProfileImageMutation.isPending
                      }
                    />
                  </div>
                )}
              </div>

              {/* User Info Details */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex flex-col items-center md:items-start text-center md:text-start w-full md:w-auto">
                    <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                      <Text
                        as="h1"
                        size="2xl"
                        font="extraBold"
                        color="primary"
                        className="tracking-tight md:text-4xl"
                      >
                        {userToDisplay?.fullName ||
                          userToDisplay?.username ||
                          "Developer"}
                      </Text>
                      {userToDisplay?.role === "SuperAdmin" ? (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full text-amber-400 border border-amber-400/40 flex items-center gap-1.5 w-fit">
                          <Crown className="h-3 w-3 text-amber-400" />
                          {t.profile.owner}
                        </span>
                      ) : userToDisplay?.role === "Admin" ? (
                        <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {t.admin.admin}
                        </span>
                      ) : null}
                    </div>

                    {userToDisplay?.fullName && (
                      <Text
                        as="p"
                        size="xs"
                        color="secondary"
                        className="font-semibold text-xs mt-0.5"
                      >
                        @{userToDisplay.username}
                      </Text>
                    )}

                    {userToDisplay?.jobTitle && (
                      <div className="flex items-center justify-center md:justify-start gap-1.5 mt-1 w-full">
                        <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                        <Text as="p" size="xs" font="semiBold" color="primary">
                          {userToDisplay.jobTitle}
                        </Text>
                      </div>
                    )}
                    {(isOwnProfile ||
                      currentUser?.role === "Admin" ||
                      currentUser?.role === "SuperAdmin") &&
                      userToDisplay?.email && (
                        <div className="flex items-center justify-center md:justify-start gap-1.5 mt-1 w-full">
                          <Mail className="h-3.5 w-3.5 text-textSecondary shrink-0" />
                          <Text as="p" size="xs" color="secondary">
                            {userToDisplay.email}
                          </Text>
                        </div>
                      )}
                    {(userToDisplay as any)?.bio && (
                      <Text
                        as="p"
                        size="xs"
                        color="secondary"
                        className="mt-2 text-xs leading-relaxed max-w-md italic"
                      >
                        "{(userToDisplay as any).bio}"
                      </Text>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                    {/* Follow / Unfollow Button for other users */}
                    {!isOwnProfile && targetUserId && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleToggleFollow}
                          variant={isFollowing ? "outline" : "default"}
                          size="sm"
                          disabled={toggleFollowMutation.isPending}
                          onMouseEnter={() => setIsFollowHovered(true)}
                          onMouseLeave={() => setIsFollowHovered(false)}
                          className={`group/followBtn rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${
                            isFollowing
                              ? isFollowHovered
                                ? "border-rose-500/50 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                                : "border-primary/40 bg-primary/10 text-primary hover:border-primary"
                              : "bg-primary hover:bg-primaryHover text-white shadow-primary/25"
                          }`}
                        >
                          {toggleFollowMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : isFollowing ? (
                            isFollowHovered ? (
                              <>
                                <X className="h-3.5 w-3.5" />
                                <span>{t.profile.unfollow}</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3.5 w-3.5 text-primary" />
                                <span>{t.profile.followingStatus}</span>
                              </>
                            )
                          ) : (
                            <>
                              <UserPlus className="h-3.5 w-3.5" />
                              <span>{t.profile.follow}</span>
                            </>
                          )}
                        </Button>

                        <Link href={`/chat?userId=${targetUserId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border-borderPrimary hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-105 active:scale-95 shadow-xs"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-primary" />
                            <span>{t.chat.directMessage}</span>
                          </Button>
                        </Link>
                      </div>
                    )}


                    {/* Edit Profile — hidden from admins on SuperAdmin profiles */}
                    {(isOwnProfile ||
                      currentUser?.role === "SuperAdmin" ||
                      (currentUser?.role === "Admin" &&
                        userToDisplay?.role !== "SuperAdmin")) && (
                      <Button
                        onClick={handleOpenEditModal}
                        variant="outline"
                        size="sm"
                        className="group/editBtn rounded-xl border border-borderPrimary hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 text-xs flex items-center gap-1.5 cursor-pointer hover:shadow-md hover:scale-105 active:scale-95"
                      >
                        <Edit className="h-3.5 w-3.5 text-textPrimary group-hover/editBtn:text-primary transition-colors" />
                        <Text
                          as="span"
                          size="xs"
                          font="semiBold"
                          color="primary"
                          className="group-hover/editBtn:text-primary transition-colors"
                        >
                          {t.profile.editProfile}
                        </Text>
                      </Button>
                    )}

                    {/* Change Password — strictly visible ONLY to local account owner */}
                    {isOwnProfile &&
                      (!userToDisplay?.provider ||
                        userToDisplay?.provider === "local") && (
                        <Button
                          onClick={() => setIsChangePasswordModalOpen(true)}
                          variant="outline"
                          size="sm"
                          className="group/pwdBtn rounded-xl border border-borderPrimary hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 text-xs flex items-center gap-1.5 cursor-pointer hover:shadow-md hover:scale-105 active:scale-95"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-textPrimary group-hover/pwdBtn:text-primary transition-colors" />
                          <Text
                            as="span"
                            size="xs"
                            font="semiBold"
                            color="primary"
                            className="group-hover/pwdBtn:text-primary transition-colors"
                          >
                            {t.profile.changePassword}
                          </Text>
                        </Button>
                      )}

                    {/* Delete User — hidden from admins on SuperAdmin profiles */}
                    {(isOwnProfile ||
                      currentUser?.role === "SuperAdmin" ||
                      (currentUser?.role === "Admin" &&
                        userToDisplay?.role !== "SuperAdmin")) && (
                      <Button
                        onClick={() => setIsDeleteUserModalOpen(true)}
                        variant="destructive"
                        size="sm"
                        disabled={deleteUserMutation.isPending}
                        className="group/delBtn rounded-xl text-xs flex items-center gap-1.5 cursor-pointer bg-rose-500/15 border border-rose-500/30 hover:bg-rose-600 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-rose-700 group-hover/delBtn:text-white transition-colors" />
                        <Text
                          as="span"
                          size="xs"
                          font="semiBold"
                          className="text-rose-700 group-hover/delBtn:text-white transition-colors"
                        >
                          {isOwnProfile
                            ? isArabic
                              ? "مسح الحساب"
                              : "Delete Account"
                            : t.admin.deleteUser}
                        </Text>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats & Details Pills */}
                <div className="flex flex-wrap items-center justify-center ltr:md:justify-start rtl:md:justify-end gap-3 pt-2">
                  {/* Following Pill */}
                  <button
                    type="button"
                    onClick={() => handleOpenFollowModal("following")}
                    className="group/stat flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bgPrimary/80 hover:bg-primary/10 border border-borderPrimary/40 hover:border-primary/40 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                    title={isArabic ? "عرض قائمة المتابَعين" : "View following"}
                  >
                    <UserCheck className="h-4 w-4 text-primary group-hover/stat:scale-110 transition-transform" />
                    <span className="font-extrabold text-xs text-textPrimary group-hover/stat:text-primary transition-colors">
                      {followingCount}
                    </span>
                    <Text
                      as="span"
                      size="xs"
                      font="semiBold"
                      color="secondary"
                      className="group-hover/stat:text-primary transition-colors"
                    >
                      {t.profile.following}
                    </Text>
                  </button>

                  {/* Followers Pill */}
                  <button
                    type="button"
                    onClick={() => handleOpenFollowModal("followers")}
                    className="group/stat flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bgPrimary/80 hover:bg-primary/10 border border-borderPrimary/40 hover:border-primary/40 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                    title={isArabic ? "عرض المتابعين" : "View followers"}
                  >
                    <Users className="h-4 w-4 text-primary group-hover/stat:scale-110 transition-transform" />
                    <span className="font-extrabold text-xs text-textPrimary group-hover/stat:text-primary transition-colors">
                      {followersCount}
                    </span>
                    <Text
                      as="span"
                      size="xs"
                      font="semiBold"
                      color="secondary"
                      className="group-hover/stat:text-primary transition-colors"
                    >
                      {t.profile.followers}
                    </Text>
                  </button>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bgPrimary/80 border border-borderPrimary/40">
                    <FileText className="h-4 w-4 text-primary" />
                    <Text as="span" size="xs" font="semiBold" color="primary">
                      {displayUserPosts.length} {t.profile.articlesPublished}
                    </Text>
                  </div>
                  {userToDisplay?.createdAt && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bgPrimary/80 border border-borderPrimary/40">
                      <Calendar className="h-4 w-4 text-primary/70" />
                      <Text as="span" size="xs" font="semiBold" color="primary">
                        {t.profile.joined} {joinedDateFormatted}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile User Posts Section */}
        <div className="space-y-6 max-w-2xl mx-auto w-full">
          <div className="flex items-center pb-2 border-b border-borderPrimary/40 w-full">
            <div className="flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-primary" />
              <Text as="h2" size="xl" font="bold" color="primary">
                {isOwnProfile
                  ? isArabic
                    ? "البوستات بتاعتي"
                    : "My Published Posts"
                  : `${userToDisplay?.fullName || userToDisplay?.username || ""} - ${t.profile.userPosts}`}
              </Text>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {displayUserPosts.length}
              </span>
            </div>
          </div>

          {/* Inline Create Post Box if viewing own profile */}
          {isOwnProfile && (
            <div className="w-full">
              <CreatePostCard />
            </div>
          )}

          {isPostsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : displayUserPosts.length === 0 ? (
            <div className="text-center py-12 p-8 rounded-2xl bg-bgSecondary/40 border border-borderPrimary/40 w-full">
              <FileText className="h-10 w-10 text-textSecondary mx-auto mb-3 opacity-40" />
              <Text as="p" size="sm" font="semiBold" color="primary">
                {t.profile.noPostsYet}
              </Text>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              {displayUserPosts.map((post: Post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userToDisplay}
        targetUserId={targetUserId}
      />

      {/* Change Password Modal (Owner Only, Local Auth Only) */}
      {isOwnProfile &&
        (!userToDisplay?.provider || userToDisplay?.provider === "local") && (
          <ChangePasswordModal
            isOpen={isChangePasswordModalOpen}
            onClose={() => setIsChangePasswordModalOpen(false)}
            targetUserId={targetUserId}
          />
        )}

      {/* Delete Profile Picture Modal */}
      <DeleteConfirmModal
        isOpen={isDeletePhotoModalOpen}
        onClose={() => setIsDeletePhotoModalOpen(false)}
        onConfirm={handleDeleteProfilePicture}
        title={t.profile.deletePhoto}
        description={t.profile.confirmDeletePhoto}
        confirmText={t.profile.deletePhoto}
        isPending={deleteProfileImageMutation.isPending}
      />

      {/* Delete User Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteUserModalOpen}
        onClose={() => setIsDeleteUserModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title={
          isOwnProfile
            ? isArabic
              ? "مسح الحساب"
              : "Delete My Account"
            : t.admin.deleteUser
        }
        description={
          isOwnProfile
            ? isArabic
              ? "انت متأكد انك عايز تمسح حسابك؟ كل البيانات والبوستات هتتمسح نهائياً."
              : "Are you sure you want to delete your account? All associated posts and data will be permanently removed."
            : isArabic
              ? "انت متأكد انك عايز تمسح حساب اليوزر ده؟ كل بياناته وهتتمسح."
              : "Are you sure you want to delete this user account?"
        }
        confirmText={
          isOwnProfile
            ? isArabic
              ? "امسح حسابي"
              : "Delete My Account"
            : t.admin.deleteUser
        }
        isPending={deleteUserMutation.isPending}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <ImageModal
          src={previewImage}
          alt={userToDisplay?.fullName || userToDisplay?.username}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* Followers & Following Modal */}
      {targetUserId && (
        <FollowersModal
          isOpen={isFollowersModalOpen}
          onClose={() => setIsFollowersModalOpen(false)}
          userId={targetUserId}
          initialTab={followModalTab}
          userName={userToDisplay?.fullName || userToDisplay?.username}
          onFollowingRemoved={() => {
            if (isOwnProfile) {
              setFollowingCountDelta((prev) => prev - 1);
            }
          }}
        />
      )}
    </div>
  );
}
