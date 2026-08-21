"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/_components/Navbar";
import PostCard from "@/_components/PostCard";
import PostCardSkeleton from "@/_components/PostCardSkeleton";
import UserProfileSidebar from "@/_components/UserProfileSidebar";
import CreatePostCard from "@/_components/CreatePostCard";
import { useGetPosts } from "@/_features/posts/hooks";
import { getAllPosts } from "@/_features/posts/api/getAllPosts";
import { Post } from "@/_features/posts/types/Post";
import { FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Text } from "@/_components/Text";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = Cookies.get("token");
  const { t } = useLanguage();

  const search = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "All";

  // Feed & Dynamic Pagination State
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    data: initialPosts,
    isLoading: isInitialLoading,
    isError: isInitialError,
    refetch,
  } = useGetPosts({
    pageNumber: 1,
    search: search || undefined,
    category: selectedCategory !== "All" ? selectedCategory : undefined,
  });

  const POSTS_PER_PAGE = 5;

  // Synchronize initial page results
  useEffect(() => {
    if (initialPosts) {
      const postsArr = Array.isArray(initialPosts) ? initialPosts : initialPosts.posts || [];
      const totalP = initialPosts.totalPages || 1;
      setFeedPosts(postsArr);
      setCurrentPage(1);
      setHasMore(1 < totalP && postsArr.length >= POSTS_PER_PAGE);
      setFetchError(null);
    }
  }, [initialPosts]);

  const observerTargetRef = React.useRef<HTMLDivElement | null>(null);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setFetchError(null);

    try {
      const nextPage = currentPage + 1;
      const response = await getAllPosts({
        pageNumber: nextPage,
        search: search || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
      });

      const newPosts = Array.isArray(response) ? response : response?.posts || [];
      const totalP = response?.totalPages || 1;

      if (newPosts && newPosts.length > 0) {
        setFeedPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const filteredNew = newPosts.filter((p) => !existingIds.has(p._id));
          return [...prev, ...filteredNew];
        });
        setCurrentPage(nextPage);
        if (nextPage >= totalP || newPosts.length < POSTS_PER_PAGE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setFetchError(
        err?.response?.data?.message ||
          "Failed to load more posts. Please try again.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isInitialLoading
        ) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    hasMore,
    isLoadingMore,
    isInitialLoading,
    currentPage,
    search,
    selectedCategory,
  ]);

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    params.delete("pageNumber");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between relative">
      {/* Background Ambient Gradient */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.02)_1px,transparent_1px)] bg-size:32px_32px" />
        <div className="absolute top-[15%] left-[5%] w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Search indicator message */}
        {search && (
          <div className="mb-6 flex items-center justify-between p-3.5 rounded-xl bg-bgSecondary/60 border border-borderPrimary/40">
            <Text as="span" size="xs" color="secondary">
              {t.home.showingResults}{" "}
              <strong className="text-textPrimary">"{search}"</strong>
            </Text>
            <button
              onClick={() => router.push("/")}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <Text as="span" size="xs" font="bold" color="primary">
                {t.home.clearSearch}
              </Text>
            </button>
          </div>
        )}

        {/* Main 2-Column Social Feed Layout (Sticky Sidebar + Single Vertical Column Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sticky Left Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 self-start order-2 lg:order-1">
            <UserProfileSidebar onOpenCreatePost={scrollToTop} />
          </aside>

          {/* Centered Single Column Vertical Posts Feed */}
          <div className="lg:col-span-3 order-1 lg:order-2 max-w-2xl mx-auto w-full space-y-6">
            {/* Inline Post Creation Box right at top of feed */}
            {token && <CreatePostCard />}

            {isInitialLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((idx) => (
                  <PostCardSkeleton key={idx} />
                ))}
              </div>
            ) : isInitialError ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-bgSecondary/30 border border-borderPrimary/40">
                <Text
                  as="h3"
                  size="lg"
                  font="bold"
                  color="primary"
                  className="mb-2"
                >
                  Failed to load feed
                </Text>
                <Text as="p" size="xs" color="secondary" className="mb-4">
                  Please check your internet connection or backend server state.
                </Text>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="gap-2 rounded-xl text-xs font-bold"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Loading Feed
                </Button>
              </div>
            ) : feedPosts && feedPosts.length > 0 ? (
              <div className="space-y-6">
                {feedPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}

                {/* PostCard Skeleton when fetching next page */}
                {isLoadingMore && (
                  <div className="pt-2">
                    <PostCardSkeleton />
                  </div>
                )}

                {/* Sentinel element for automatic infinite scroll */}
                <div
                  ref={observerTargetRef}
                  className="h-4 w-full pointer-events-none"
                />

                {/* End of Feed / Error indicator */}
                <div className="pt-2 pb-8 flex flex-col items-center justify-center gap-3">
                  {fetchError && (
                    <div className="text-center space-y-2 mb-2">
                      <Text
                        as="p"
                        size="xs"
                        className="text-rose-500 font-semibold"
                      >
                        {fetchError}
                      </Text>
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs cursor-pointer"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  {!hasMore && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-bgSecondary/40 border border-borderPrimary/30 text-xs text-textSecondary">
                      <Text as="span" size="xs" color="secondary">
                        {t.home.reachedEnd}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-bgSecondary/30 border border-borderPrimary/40">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <Text
                  as="h3"
                  size="xl"
                  font="bold"
                  color="primary"
                  className="mb-2"
                >
                  {t.home.noArticlesTitle}
                </Text>
                <Text
                  as="p"
                  size="xs"
                  color="secondary"
                  className="max-w-md mb-6 md:text-sm"
                >
                  {t.home.noArticlesDesc}
                </Text>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-borderPrimary/20 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-textSecondary">
        <Text as="p" size="xs" color="secondary">
          © {new Date().getFullYear()} {t.home.footerRights}{" "}
          <Link
            className="transition-all duration-300"
            href={"https://emad-site.vercel.app/"}
            target="_blank"
          >
            <Text
              as="span"
              size="xs"
              font="bold"
              color="primary"
              className="hover:text-primary hover:underline"
            >
              Emad Ahmed
            </Text>
          </Link>
        </Text>
        <div className="flex gap-4">
          <Text as="span" size="xs" color="secondary">
            {t.home.terms}
          </Text>
          <Text as="span" size="xs" color="secondary">
            {t.home.privacy}
          </Text>
          <Text as="span" size="xs" color="secondary">
            {t.home.apiDoc}
          </Text>
        </div>
      </footer>
    </div>
  );
}
