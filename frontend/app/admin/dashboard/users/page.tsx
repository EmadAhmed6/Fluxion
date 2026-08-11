"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
import AdminSidebar from "@/_components/AdminSidebar";
import { Text } from "@/_components/Text";
import { useGetAllUsers, useDeleteUser, useToggleAdminStatus } from "@/_features/user/hooks";
import { useGetPosts } from "@/_features/posts/hooks";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Trash2,
  Loader2,
  Mail,
  Calendar,
  Briefcase,
  User as UserIcon,
  Search,
  ArrowLeft,
  ArrowRight,
  Edit,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/_components/DeleteConfirmModal";
import EditProfileModal from "@/_components/EditProfileModal";
import Tooltip from "@/_components/Tooltip";
import UserHoverCard from "@/_components/UserHoverCard";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminUsersPage() {
  const { data: currentUser, isLoading: isAuthLoading } = useGetAuthMeQuery();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [debouncedJobTitle, setDebouncedJobTitle] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [providerFilter, setProviderFilter] = useState<"all" | "local" | "google" | "github">("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [userToEdit, setUserToEdit] = useState<string | null>(null);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<{
    id: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageNumber(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedJobTitle(jobTitleFilter);
      setPageNumber(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [jobTitleFilter]);

  const handleRoleFilterChange = (newRole: "all" | "admin" | "user") => {
    setRoleFilter(newRole);
    setPageNumber(1);
  };

  const handleProviderFilterChange = (newProvider: "all" | "local" | "google" | "github") => {
    setProviderFilter(newProvider);
    setPageNumber(1);
  };

  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers({
    search: debouncedSearch,
    role: roleFilter === "all" ? undefined : roleFilter === "admin" ? "Admin" : "User",
    provider: providerFilter === "all" ? undefined : providerFilter,
    jobTitle: debouncedJobTitle || undefined,
    pageNumber,
  });

  const { data: posts } = useGetPosts();
  const deleteUserMutation = useDeleteUser();
  const toggleAdminMutation = useToggleAdminStatus();
  const { t, isArabic } = useLanguage();

  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;

  if (currentUser?.role !== "Admin" && currentUser?.role !== "SuperAdmin") {
    return (
      <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <Text
            as="h1"
            size="2xl"
            font="extraBold"
            color="primary"
            className="mb-2"
          >
            {isArabic ? "غير مسموح بالدخول" : "Access Denied"}
          </Text>
          <Text
            as="p"
            size="xs"
            color="secondary"
            className="mb-6 leading-relaxed"
          >
            {isArabic
              ? "معندكش صلاحيات أدمن عشان تدخل لوحة التحكم."
              : "You do not have administrative privileges to access the Admin Dashboard."}
          </Text>
          <Link href="/">
            <Button className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold cursor-pointer">
              <BackIcon className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
              <Text as="span" size="xs" font="semiBold" color="white">
                {t.post.backToFeed}
              </Text>
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const allUsersList = Array.isArray(usersData) ? usersData : usersData?.users || [];
  const allPostsList = Array.isArray(posts) ? posts : [];
  const currentPage = usersData?.page || pageNumber;
  const totalPages = usersData?.pages || 1;
  const totalUsers = usersData?.totalUsers ?? allUsersList.length;

  const adminUsersCount = allUsersList.filter((u) => u.role === "Admin" || u.role === "SuperAdmin").length;
  const regularUsersCount = allUsersList.filter((u) => u.role === "User").length;

  const handleConfirmDeleteUser = async () => {
    if (!selectedUserToDelete) return;
    try {
      await deleteUserMutation.mutateAsync(selectedUserToDelete.id);
      setSelectedUserToDelete(null);
    } catch {
      // Handled in mutation
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <Text
              as="h1"
              size="3xl"
              font="extraBold"
              color="primary"
              className="tracking-tight"
            >
              {t.admin.dashboard}
            </Text>
            <Text as="p" size="xs" color="secondary">
              {isArabic
                ? "إدارة اليوزرات والبوستات المنشورة وإحصائيات السيستم"
                : "Manage system users, published posts, and platform metrics"}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <AdminSidebar
              currentUser={currentUser}
              totalUsers={totalUsers}
              totalPosts={allPostsList.length}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Section Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Text as="h2" size="xl" font="bold" color="primary">
                  {t.admin.usersManagement}
                </Text>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Provider Select Filter */}
                <select
                  value={providerFilter}
                  onChange={(e) => handleProviderFilterChange(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl bg-bgSecondary border border-borderPrimary text-textPrimary outline-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
                >
                  <option value="all">{t.admin.allProviders}</option>
                  <option value="local">{t.admin.localProvider}</option>
                  <option value="google">{t.admin.googleProvider}</option>
                  <option value="github">{t.admin.githubProvider}</option>
                </select>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                  <input
                    type="text"
                    placeholder={t.admin.searchUsers}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2 text-xs rounded-xl bg-bgSecondary border border-borderPrimary text-textPrimary outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Stats Summary Cards (Filterable) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleRoleFilterChange("all")}
                className={`p-5 rounded-2xl bg-bgSecondary/70 border transition-all text-left rtl:text-right flex items-center gap-4 cursor-pointer hover:border-primary ${
                  roleFilter === "all"
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-borderPrimary/50"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <Text as="p" size="xs" font="medium" color="secondary">
                    {isArabic ? "إجمالي المسجلين" : "Total Registered"}
                  </Text>
                  <Text as="h3" size="2xl" font="black" color="primary">
                    {totalUsers}
                  </Text>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleFilterChange("admin")}
                className={`p-5 rounded-2xl bg-bgSecondary/70 border transition-all text-left rtl:text-right flex items-center gap-4 cursor-pointer hover:border-amber-500 ${
                  roleFilter === "admin"
                    ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                    : "border-borderPrimary/50"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <Text as="p" size="xs" font="medium" color="secondary">
                    {isArabic ? "الأدمنز" : "Administrators"}
                  </Text>
                  <Text as="h3" size="2xl" font="black" color="primary">
                    {adminUsersCount}
                  </Text>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleFilterChange("user")}
                className={`p-5 rounded-2xl bg-bgSecondary/70 border transition-all text-left rtl:text-right flex items-center gap-4 cursor-pointer hover:border-emerald-500 ${
                  roleFilter === "user"
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                    : "border-borderPrimary/50"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <Text as="p" size="xs" font="medium" color="secondary">
                    {isArabic ? "مستخدمين عاديين" : "Standard Users"}
                  </Text>
                  <Text as="h3" size="2xl" font="black" color="primary">
                    {regularUsersCount}
                  </Text>
                </div>
              </button>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-bgSecondary/50 border border-borderPrimary/50 overflow-hidden shadow-lg">
              {isUsersLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allUsersList.length === 0 ? (
                <div className="py-16 text-center">
                  <Text as="p" size="xs" color="secondary">
                    {isArabic
                      ? "ملقيناش أي يوزر يطابق البحث أو الفلتر."
                      : "No users found matching your search query or filter."}
                  </Text>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full ltr:text-left rtl:text-right text-xs">
                    <thead className="bg-bgSecondary/90 text-textSecondary font-semibold uppercase tracking-wider border-b border-borderPrimary/40">
                      <tr>
                        <th className="px-6 py-4">
                          {isArabic ? "اليوزر" : "User"}
                        </th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">{t.admin.provider}</th>
                        <th className="px-6 py-4">{t.profile.jobTitle}</th>
                        <th className="px-6 py-4">{t.admin.role}</th>
                        <th className="px-6 py-4">{t.profile.joined}</th>
                        <th className="px-6 py-4 ltr:text-right rtl:text-left">
                          {t.admin.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderPrimary/30 text-textPrimary font-medium">
                      {allUsersList.map((userItem) => (
                        <tr
                          key={userItem._id}
                          className="hover:bg-bgSecondary/80 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <UserHoverCard
                              user={userItem as any}
                              position={isArabic ? "left" : "right"}
                            >
                              <Link
                                href={`/profile/${userItem._id}`}
                                className="flex items-center gap-3 group"
                              >
                                {userItem.profilePicture?.url ? (
                                  <img
                                    src={userItem.profilePicture.url}
                                    alt={userItem.username}
                                    className="h-9 w-9 rounded-xl object-cover border border-borderPrimary group-hover:border-primary transition-colors"
                                  />
                                ) : (
                                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <UserIcon className="h-4 w-4" />
                                  </div>
                                )}
                                <div>
                                  <Text
                                    as="p"
                                    size="xs"
                                    font="bold"
                                    color="primary"
                                    className="group-hover:text-primary transition-colors flex items-center gap-1.5"
                                  >
                                    {userItem.username}
                                  </Text>
                                  {userItem.fullName && (
                                    <Text
                                      as="p"
                                      size="xs"
                                      color="secondary"
                                      className="text-[11px] opacity-75"
                                    >
                                      {userItem.fullName}
                                    </Text>
                                  )}
                                </div>
                              </Link>
                            </UserHoverCard>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {userItem.email ? (
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-textSecondary/70" />
                                <Text as="span" size="xs" color="secondary">
                                  {userItem.email}
                                </Text>
                              </div>
                            ) : (
                              <Text
                                as="span"
                                size="xs"
                                color="secondary"
                                className="italic opacity-50"
                              >
                                —
                              </Text>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {userItem.provider === "google" ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 w-fit">
                                Google
                              </span>
                            ) : userItem.provider === "github" ? (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 w-fit">
                                GitHub
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit">
                                Email
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {userItem.jobTitle ? (
                              <div className="flex items-center gap-1.5 text-primary">
                                <Briefcase className="h-3.5 w-3.5" />
                                <Text
                                  as="span"
                                  size="xs"
                                  font="medium"
                                  color="primary"
                                >
                                  {userItem.jobTitle}
                                </Text>
                              </div>
                            ) : (
                              <Text
                                as="span"
                                size="xs"
                                color="secondary"
                                className="italic opacity-50"
                              >
                                —
                              </Text>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {userItem.role === "SuperAdmin" ? (
                              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full text-amber-400 border border-amber-400/40 flex items-center gap-1.5 w-fit">
                                <Crown className="h-3 w-3 text-amber-400" />
                                OWNER
                              </span>
                            ) : userItem.role === "Admin" ? (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1 w-fit">
                                <ShieldCheck className="h-3 w-3" />
                                {t.admin.admin}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-500/15 text-textSecondary border border-borderPrimary/40 w-fit">
                                {t.admin.user}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {userItem.createdAt ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-textSecondary/70" />
                                <Text as="span" size="xs" color="secondary">
                                  {new Date(
                                    userItem.createdAt,
                                  ).toLocaleDateString(
                                    isArabic ? "ar-EG" : "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </Text>
                              </div>
                            ) : (
                              <Text
                                as="span"
                                size="xs"
                                color="secondary"
                                className="italic opacity-50"
                              >
                                —
                              </Text>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap ltr:text-right rtl:text-left">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit button */}
                              {(currentUser?.role === "SuperAdmin" || userItem.role !== "SuperAdmin") && (
                                <Tooltip
                                  position="top"
                                  content={
                                    isArabic
                                      ? "تعديل بيانات اليوزر"
                                      : "Edit User Profile"
                                  }
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUserToEdit(userItem._id)}
                                    className="h-8 w-8 p-0 rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all hover:scale-105"
                                  >
                                    <Edit className="h-3.5 w-3.5 text-textSecondary hover:text-primary" />
                                  </Button>
                                </Tooltip>
                              )}

                              {userItem._id && (
                                <Tooltip
                                  position="top"
                                  content={t.profile.userProfile}
                                >
                                  <Link href={`/profile/${userItem._id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-xl cursor-pointer hover:border-primary hover:text-primary transition-all hover:scale-105"
                                    >
                                      <UserIcon className="h-3.5 w-3.5 text-textSecondary hover:text-primary" />
                                    </Button>
                                  </Link>
                                </Tooltip>
                              )}

                              {/* Promote / Demote Admin button */}
                              {currentUser?.role === "SuperAdmin" &&
                                userItem.role !== "SuperAdmin" && (
                                  <Tooltip
                                    position="top"
                                    content={
                                      userItem.role === "Admin"
                                        ? isArabic
                                          ? "إلغاء صلاحية الأدمن"
                                          : "Remove Admin"
                                        : isArabic
                                          ? "تعيين كأدمن"
                                          : "Set as Admin"
                                    }
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        toggleAdminMutation.mutate(userItem._id)
                                      }
                                      disabled={
                                        toggleAdminMutation.isPending
                                      }
                                      className={`h-8 w-8 p-0 rounded-xl cursor-pointer transition-all hover:scale-105 ${
                                        userItem.role === "Admin"
                                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-white"
                                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                                      }`}
                                    >
                                      {userItem.role === "Admin" ? (
                                        <ShieldOff className="h-3.5 w-3.5" />
                                      ) : (
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </Tooltip>
                                )}

                              <Tooltip
                                position="top"
                                content={t.admin.deleteUser}
                              >
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedUserToDelete({
                                      id: userItem._id,
                                      username: userItem.username,
                                    })
                                  }
                                  disabled={
                                    deleteUserMutation.isPending &&
                                    selectedUserToDelete?.id === userItem._id
                                  }
                                  className="group/delete h-8 w-8 p-0 rounded-xl flex items-center justify-center cursor-pointer bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all hover:scale-105"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-500 group-hover/delete:text-white transition-colors" />
                                </Button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-borderPrimary/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-bgSecondary/30">
                  <Text as="p" size="xs" color="secondary">
                    {isArabic
                      ? `صفحة ${currentPage} من ${totalPages} (إجمالي ${totalUsers} مستخدم)`
                      : `Page ${currentPage} of ${totalPages} (${totalUsers} total users)`}
                  </Text>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1 || isUsersLoading}
                      className="rounded-xl text-xs gap-1 cursor-pointer"
                    >
                      <BackIcon className="h-3.5 w-3.5" />
                      <Text as="span" size="xs" color="primary">
                        {t.admin.previousPage}
                      </Text>
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPageNumber(p)}
                        disabled={isUsersLoading}
                        className={`h-8 w-8 p-0 rounded-xl text-xs font-bold cursor-pointer ${
                          p === currentPage ? "bg-primary text-white" : ""
                        }`}
                      >
                        {p}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages || isUsersLoading}
                      className="rounded-xl text-xs gap-1 cursor-pointer"
                    >
                      <Text as="span" size="xs" color="primary">
                        {t.admin.nextPage}
                      </Text>
                      <NextIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {userToEdit && (() => {
        const freshUser = allUsersList.find((u) => u._id === userToEdit);
        if (!freshUser) return null;
        return (
          <EditProfileModal
            isOpen={true}
            onClose={() => setUserToEdit(null)}
            user={freshUser}
            targetUserId={freshUser._id}
          />
        );
      })()}

      {/* Delete User Modal */}
      <DeleteConfirmModal
        isOpen={!!selectedUserToDelete}
        onClose={() => setSelectedUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        title={t.admin.deleteUser}
        description={
          isArabic
            ? `انت متأكد انك عايز تمسح حساب "${selectedUserToDelete?.username}"؟ كل مقالاته وكومنتاته هتتمسح نهائياً.`
            : `Are you sure you want to delete user account "${selectedUserToDelete?.username}"? All associated posts and comments will be permanently removed.`
        }
        confirmText={t.admin.deleteUser}
        isPending={deleteUserMutation.isPending}
      />
    </div>
  );
}
