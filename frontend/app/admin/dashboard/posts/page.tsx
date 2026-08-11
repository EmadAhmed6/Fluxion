"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
import AdminSidebar from "@/_components/AdminSidebar";
import { Text } from "@/_components/Text";
import { useGetAllUsers } from "@/_features/user/hooks";
import { useGetPosts, useDeletePost } from "@/_features/posts/hooks";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import {
  FileText,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Loader2,
  Heart,
  MessageSquare,
  Share2,
  Search,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Layers,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/_components/DeleteConfirmModal";
import Tooltip from "@/_components/Tooltip";
import UserListTooltip from "@/_components/UserListTooltip";
import AuthorProfileTooltip from "@/_components/AuthorProfileTooltip";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminPostsPage() {
  const { data: currentUser, isLoading: isAuthLoading } = useGetAuthMeQuery();
  const { data: users } = useGetAllUsers();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedPostToDelete, setSelectedPostToDelete] = useState<{
    id: string;
    title: string;
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

  const { data: postsData, isLoading: isPostsLoading } = useGetPosts({
    search: debouncedSearch || undefined,
    pageNumber,
  });

  const deletePostMutation = useDeletePost();
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

  const allUsersList = Array.isArray(users) ? users : users?.users || [];
  const allPostsList = Array.isArray(postsData) ? postsData : postsData?.posts || [];
  const currentPage = postsData?.page || pageNumber;
  const totalPages = postsData?.totalPages || 1;
  const totalPosts = postsData?.totalPosts ?? allPostsList.length;

  const totalLikes = allPostsList.reduce(
    (acc, p) => acc + (p.likesCount || p.likes?.length || 0),
    0,
  );
  const totalShares = allPostsList.reduce(
    (acc, p) =>
      acc +
      (p.sharesCount !== undefined
        ? p.sharesCount
        : Array.isArray(p.shares)
          ? p.shares.length
          : 0),
    0,
  );
  const totalReactions = totalLikes + totalShares;
  const categoriesCount = new Set(allPostsList.map((p) => p.category)).size;

  const handleConfirmDeletePost = async () => {
    if (!selectedPostToDelete) return;
    try {
      await deletePostMutation.mutateAsync(selectedPostToDelete.id);
      setSelectedPostToDelete(null);
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
                ? "إدارة البوستات المنشورة وإحصائيات السيستم"
                : "Manage system posts and platform metrics"}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <AdminSidebar
              currentUser={currentUser}
              totalUsers={allUsersList.length}
              totalPosts={totalPosts}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Section Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Text as="h2" size="xl" font="bold" color="primary">
                  {t.admin.postsManagement}
                </Text>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <input
                  type="text"
                  placeholder={t.admin.searchPosts}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2 text-xs rounded-xl bg-bgSecondary border border-borderPrimary text-textPrimary outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-bgSecondary/70 border border-borderPrimary/50 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <Text as="p" size="xs" font="medium" color="secondary">
                    {isArabic ? "إجمالي البوستات" : "Total Posts"}
                  </Text>
                  <Text as="h3" size="2xl" font="black" color="primary">
                    {totalPosts}
                  </Text>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bgSecondary/70 border border-borderPrimary/50 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <Text as="p" size="xs" font="medium" color="secondary">
                    {isArabic ? "إجمالي التفاعلات" : "Total Reactions"}
                  </Text>
                  <Text as="h3" size="2xl" font="black" color="primary">
                    {totalReactions}
                  </Text>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bgSecondary/70 border border-borderPrimary/50 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <Text as="p" size="xs" font="medium" color="secondary">
                    {isArabic ? "الفئات النشطة" : "Active Categories"}
                  </Text>
                  <Text as="h3" size="2xl" font="black" color="primary">
                    {categoriesCount}
                  </Text>
                </div>
              </div>
            </div>

            {/* Posts Table */}
            <div className="rounded-2xl bg-bgSecondary/50 border border-borderPrimary/50 overflow-hidden shadow-lg">
              {isPostsLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allPostsList.length === 0 ? (
                <div className="py-16 text-center">
                  <Text as="p" size="xs" color="secondary">
                    {isArabic
                      ? "ملقيناش أي بوست يطابق البحث بتاعك."
                      : "No posts found matching your search query."}
                  </Text>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full ltr:text-left rtl:text-right text-xs">
                    <thead className="bg-bgSecondary/90 text-textSecondary font-semibold uppercase tracking-wider border-b border-borderPrimary/40">
                      <tr>
                        <th className="px-6 py-4">
                          {isArabic ? "عنوان البوست" : "Post Title"}
                        </th>
                        <th className="px-6 py-4">
                          {isArabic ? "الكاتب" : "Author"}
                        </th>
                        <th className="px-6 py-4">
                          {isArabic
                            ? "التفاعلات والكومنتات"
                            : "Reactions & Comments"}
                        </th>
                        <th className="px-6 py-4">
                          {isArabic ? "تاريخ النشر" : "Published Date"}
                        </th>
                        <th className="px-6 py-4 ltr:text-right rtl:text-left">
                          {t.admin.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderPrimary/30 text-textPrimary font-medium">
                      {allPostsList.map((postItem) => {
                        const authorObj =
                          typeof postItem.user === "object"
                            ? postItem.user
                            : null;
                        const authorId =
                          typeof postItem.user === "string"
                            ? postItem.user
                            : authorObj?._id;
                        const authorUsername =
                          authorObj?.username || t.post.anonymousAuthor;

                        const likes = postItem.likes?.length || 0;
                        const sharesCount = postItem.shares?.length || 0;
                        const commentsCount = postItem.comments?.length || 0;

                        return (
                          <tr
                            key={postItem._id}
                            className="hover:bg-bgSecondary/80 transition-colors min-w-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/posts/${postItem._id}`}
                                className="group/article flex items-center gap-3 max-w-xs cursor-pointer"
                              >
                                {postItem.postImage?.url ||
                                postItem.image?.url ? (
                                  <img
                                    src={
                                      postItem.postImage?.url ||
                                      postItem.image?.url
                                    }
                                    alt={postItem.title}
                                    className="h-10 w-14 rounded-lg object-cover border border-borderPrimary group-hover/article:border-primary/50 group-hover/article:scale-105 transition-all duration-200 shrink-0"
                                  />
                                ) : (
                                  <div className="h-10 w-14 rounded-lg bg-primary/10 group-hover/article:bg-primary/20 flex items-center justify-center text-primary transition-colors shrink-0">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                )}
                                <div className="overflow-hidden">
                                  <Text
                                    as="span"
                                    size="xs"
                                    font="bold"
                                    color="primary"
                                    className="truncate block group-hover/article:text-primary group-hover/article:underline transition-colors"
                                  >
                                    {postItem.title}
                                  </Text>
                                  <Text
                                    as="span"
                                    size="xs"
                                    color="secondary"
                                    className="text-[10px] block truncate group-hover/article:text-textPrimary/80 transition-colors opacity-80"
                                  >
                                    {postItem.description}
                                  </Text>
                                </div>
                              </Link>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {authorId ? (
                                <Tooltip
                                  position="top"
                                  content={
                                    <AuthorProfileTooltip
                                      user={authorObj}
                                      userId={authorId}
                                    />
                                  }
                                >
                                  <Link
                                    href={`/profile/${authorId}`}
                                    className="group/author inline-flex items-center gap-2 max-w-44 px-2.5 py-1.5 rounded-xl hover:bg-primary/10 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                                  >
                                    {authorObj?.profilePicture?.url ? (
                                      <img
                                        src={authorObj.profilePicture.url}
                                        alt={authorUsername}
                                        className="h-6 w-6 rounded-full object-cover border border-borderPrimary/50 group-hover/author:scale-110 transition-transform shrink-0"
                                      />
                                    ) : (
                                      <div className="h-6 w-6 rounded-full bg-primary/10 group-hover/author:bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold transition-colors shrink-0">
                                        {authorUsername?.[0]?.toUpperCase() ||
                                          "U"}
                                      </div>
                                    )}
                                    <Text
                                      as="span"
                                      size="xs"
                                      font="semiBold"
                                      color="primary"
                                      className="group-hover/author:text-primary group-hover/author:underline transition-colors truncate"
                                    >
                                      {authorUsername}
                                    </Text>
                                  </Link>
                                </Tooltip>
                              ) : (
                                <div className="inline-flex items-center gap-2 px-2.5 py-1.5 max-w-44">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                                    U
                                  </div>
                                  <Text
                                    as="span"
                                    size="xs"
                                    font="semiBold"
                                    color="primary"
                                    className="truncate"
                                  >
                                    {t.post.anonymousAuthor}
                                  </Text>
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2.5 text-[11px]">
                                <Tooltip
                                  position="bottom"
                                  content={
                                    <UserListTooltip
                                      users={postItem.likes}
                                      type="like"
                                    />
                                  }
                                >
                                  <span className="flex items-center gap-1 text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer font-semibold border border-transparent hover:border-rose-500/20">
                                    <Heart className="h-3.5 w-3.5 fill-rose-500/20" />
                                    {likes}
                                  </span>
                                </Tooltip>

                                <Tooltip
                                  position="bottom"
                                  content={t.post.viewComments}
                                >
                                  <Link
                                    href={`/posts/${postItem._id}#comments`}
                                    className="flex items-center gap-1 text-sky-500 hover:bg-sky-500/10 px-2 py-1 rounded-lg transition-colors font-semibold border border-transparent hover:border-sky-500/20"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    {commentsCount}
                                  </Link>
                                </Tooltip>

                                <Tooltip
                                  position="bottom"
                                  content={
                                    <UserListTooltip
                                      users={postItem.shares}
                                      type="share"
                                    />
                                  }
                                >
                                  <span className="flex items-center gap-1 text-emerald-500 hover:bg-emerald-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer font-semibold border border-transparent hover:border-emerald-500/20">
                                    <Share2 className="h-3.5 w-3.5" />
                                    {sharesCount}
                                  </span>
                                </Tooltip>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              {postItem.createdAt ? (
                                <Text as="span" size="xs" color="secondary">
                                  {new Date(
                                    postItem.createdAt,
                                  ).toLocaleDateString(
                                    isArabic ? "ar-EG" : "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </Text>
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
                                <Tooltip
                                  position="top"
                                  content={t.post.viewArticle}
                                >
                                  <Link href={`/posts/${postItem._id}`}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:border-primary hover:text-primary"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5 text-textSecondary hover:text-primary" />
                                    </Button>
                                  </Link>
                                </Tooltip>
                                <Tooltip position="top" content={t.post.delete}>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      setSelectedPostToDelete({
                                        id: postItem._id,
                                        title: postItem.title,
                                      })
                                    }
                                    disabled={
                                      deletePostMutation.isPending &&
                                      selectedPostToDelete?.id === postItem._id
                                    }
                                    className="group/delete h-8 w-8 p-0 rounded-xl flex items-center justify-center cursor-pointer bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all hover:scale-105"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500 group-hover/delete:text-white transition-colors" />
                                  </Button>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-borderPrimary/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-bgSecondary/30">
                  <Text as="p" size="xs" color="secondary">
                    {isArabic
                      ? `صفحة ${currentPage} من ${totalPages} (إجمالي ${totalPosts} بوست)`
                      : `Page ${currentPage} of ${totalPages} (${totalPosts} total posts)`}
                  </Text>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1 || isPostsLoading}
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
                        disabled={isPostsLoading}
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
                      disabled={currentPage >= totalPages || isPostsLoading}
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

      <DeleteConfirmModal
        isOpen={!!selectedPostToDelete}
        onClose={() => setSelectedPostToDelete(null)}
        onConfirm={handleConfirmDeletePost}
        title={t.post.deleteTitle}
        description={
          isArabic
            ? `انت متأكد انك عايز تمسح المقال "${selectedPostToDelete?.title}"؟ الحركة دي مش هينفع ترجع فيها.`
            : `Are you sure you want to delete the post titled "${selectedPostToDelete?.title}"? This action cannot be undone.`
        }
        confirmText={t.post.deleteConfirm}
        isPending={deletePostMutation.isPending}
      />
    </div>
  );
}
