"use client";

import React, { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "@/lib/toast";
import { useLanguage } from "@/context/LanguageContext";
import { Text } from "@/_components/Text";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isArabic } = useLanguage();
  const hasProcessed = useRef(false);

  const provider =
    searchParams.get("provider") ||
    (searchParams.get("error")?.includes("google") ? "google" : "github");
  const isGoogle = provider === "google";

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      hasProcessed.current = true;
      Cookies.set("token", token, { expires: 7, path: "/" });
      queryClient.invalidateQueries({ queryKey: ["authMe"] });
      toast.success(
        isGoogle
          ? isArabic
            ? "تم تسجيل الدخول بواسطة Google بنجاح!"
            : "Logged in via Google successfully!"
          : isArabic
            ? "تم تسجيل الدخول بواسطة GitHub بنجاح!"
            : "Logged in via GitHub successfully!",
      );
      router.refresh();
      router.push("/");
    } else if (error) {
      hasProcessed.current = true;
      toast.error(
        isGoogle
          ? isArabic
            ? "فشل تسجيل الدخول بواسطة Google. حاول مرة أخرى."
            : "Google authentication failed. Please try again."
          : isArabic
            ? "فشل تسجيل الدخول بواسطة GitHub. حاول مرة أخرى."
            : "GitHub authentication failed. Please try again.",
      );
      router.push("/auth/login");
    }
  }, [searchParams, router, queryClient, isArabic, isGoogle]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md w-full">
        <span className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <Text font="bold" size="lg" color="primary">
          {isGoogle
            ? isArabic
              ? "جاري إكمال تسجيل الدخول بواسطة Google..."
              : "Completing Google sign in..."
            : isArabic
              ? "جاري إكمال تسجيل الدخول بواسطة GitHub..."
              : "Completing GitHub sign in..."}
        </Text>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-md w-full">
            <span className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
