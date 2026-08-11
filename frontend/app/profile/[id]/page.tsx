"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Navbar from "@/_components/Navbar";
import PostCard from "@/_components/PostCard";
import CreatePostCard from "@/_components/CreatePostCard";
import EditProfileModal from "@/_components/EditProfileModal";
import {
  useGetUserProfile,
  useUploadProfilePicture,
  useDeleteUser,
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
} from "lucide-react";
import ImageModal from "@/_components/ImageModal";
import DeleteConfirmModal from "@/_components/DeleteConfirmModal";
import ChangePasswordModal from "@/_components/ChangePasswordModal";
import { Button } from "@/components/ui/button";
import { Text } from "@/_components/Text";
import { Post } from "@/_features/posts/types/Post";
import { useLanguage } from "@/context/LanguageContext";

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
  const deleteUserMutation = useDeleteUser();

  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userToDisplay =
    profileUser || (isOwnProfile ? currentUser : null) || currentUser;

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
      }
    }
  };

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const fetchedUserPosts = Array.isArray(userPosts) ? userPosts : userPosts?.posts || [];
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

                {/* Edit Avatar Pen Button (Owner or Admin — but not admin on SuperAdmin profile) */}
                {(isOwnProfile ||
                  currentUser?.role === "SuperAdmin" ||
                  (currentUser?.role === "Admin" && userToDisplay?.role !== "SuperAdmin")) && (
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="absolute -bottom-1 ltr:-right-1 rtl:-left-1 p-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white shadow-lg border-2 border-bgSecondary transition-transform hover:scale-110 cursor-pointer z-20"
                    title={t.profile.changePhoto}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Edit2 className="h-4 w-4 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
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

                  <div className="flex items-center gap-2">
                    {/* Edit Profile — hidden from admins on SuperAdmin profiles */}
                    {(isOwnProfile ||
                      currentUser?.role === "SuperAdmin" ||
                      (currentUser?.role === "Admin" && userToDisplay?.role !== "SuperAdmin")) && (
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
                    {isOwnProfile && (!userToDisplay?.provider || userToDisplay?.provider === "local") && (
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
                      (currentUser?.role === "Admin" && userToDisplay?.role !== "SuperAdmin")) && (
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
      {isOwnProfile && (!userToDisplay?.provider || userToDisplay?.provider === "local") && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          targetUserId={targetUserId}
        />
      )}

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
    </div>
  );
}
