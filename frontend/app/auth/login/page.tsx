"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type ILogin } from "@/_features/auth/schemas/auth";
import { useLoginMutation } from "@/_features/auth/hooks";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "@/lib/toast";
import { Text } from "@/_components/Text";
import Error from "@/_components/Error";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const loginMutation = useLoginMutation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, isArabic } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<ILogin>({
    resolver: zodResolver(loginSchema as any),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: ILogin) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        const token = res.data?.token || res.token;
        if (token) {
          Cookies.set("token", token, { expires: 7, path: "/" });
          queryClient.invalidateQueries({ queryKey: ["authMe"] });
          toast.success(
            isArabic
              ? "تم تسجيل الدخول بنجاح! مرحب بيك."
              : "Signed in successfully! Welcome back.",
          );
          router.refresh();
          router.push("/");
          reset();
        } else {
          toast.error(
            isArabic
              ? "تم الدخول بنجاح لكن مفيش توكن."
              : "Login successful but token missing from server response.",
          );
        }
      },
      onError: (err: any) => {
        const errorMsg =
          err?.response?.data?.message ||
          (isArabic
            ? "الإيميل أو الباسورد غلط. حاول تاني."
            : "Invalid email or password. Please try again.");

        toast.error(errorMsg);

        if (
          err?.response?.status === 403 ||
          err?.response?.data?.isVerified === false ||
          errorMsg.toLowerCase().includes("verify")
        ) {
          const userEmail = data.email.trim();
          setTimeout(() => {
            router.push(
              `/auth/verify-otp?email=${encodeURIComponent(userEmail)}`,
            );
          }, 1200);
        }
      },
    });
  };

  const SubmitIcon = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full max-w-md glass-card p-8 md:p-10 transition-all duration-300">
      {/* Header */}
      <div className="text-center mb-8 flex flex-col items-center">
        <Link href="/" className="mb-4 inline-block group">
          <Image
            src="/logo.png"
            alt="Fluxion Logo"
            width={48}
            height={48}
            className="mx-auto group-hover:scale-105 transition-transform"
          />
        </Link>
        <Text as="h1" size="3xl" font="bold" color="primary" className=" mb-2">
          {t.auth.welcomeBack}
        </Text>
        <Text size="sm" color="secondary">
          {t.auth.welcomeBackDesc}
        </Text>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Identifier Field (Email or Username) */}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.auth.loginIdentifierLabel}</Label>
          <Input
            id="email"
            type="text"
            icon="user"
            placeholder={t.auth.loginIdentifierPlaceholder}
            disabled={loginMutation.isPending}
            hasError={!!errors.email}
            {...register("email", { onChange: () => clearErrors("email") })}
          />
          <Error error={errors.email?.message} />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.auth.passwordLabel}</Label>
          </div>

          <Input
            id="password"
            type="password"
            icon="lock"
            placeholder={t.auth.passwordPlaceholder}
            disabled={loginMutation.isPending}
            hasError={!!errors.password}
            {...register("password", {
              onChange: () => clearErrors("password"),
            })}
          />
          <Error error={errors.password?.message} />
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            href="/auth/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t.auth.forgotPasswordLink}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          size="lg"
          className="w-full cursor-pointer"
        >
          {loginMutation.isPending ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <Text as="span" font="semiBold" color="white">
                {t.auth.signingInBtn}
              </Text>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Text as="span" font="semiBold" color="white">
                {t.auth.signInBtn}
              </Text>
              <SubmitIcon className="h-4.5 w-4.5 group-hover/button:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>

      {/* OAuth Login (Google & GitHub) */}
      <div className="mt-6">
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-borderPrimary/40 w-full" />
          <span className="px-3 text-xs text-textSecondary font-medium uppercase absolute">
            {t.auth.orDivider}
          </span>
        </div>

        <div className="space-y-3">
          {/* Google OAuth Login */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-borderPrimary/60 bg-bgSecondary/10 hover:bg-bgSecondary/20 transition-all font-medium text-sm text-foreground shadow-xs hover:shadow active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.98 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{t.auth.continueWithGoogle}</span>
          </a>

          {/* GitHub OAuth Login */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-borderPrimary/60 bg-bgSecondary/10 hover:bg-bgSecondary/20 transition-all font-medium text-sm text-foreground shadow-xs hover:shadow active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{t.auth.continueWithGithub}</span>
          </a>
        </div>
      </div>

      {/* Switch to register link */}
      <div className="mt-6 text-center border-t border-borderPrimary/40 pt-4">
        <Text size="xs" color="secondary">
          {t.auth.dontHaveAccount}{" "}
          <Link
            href="/auth/register"
            className="text-primary hover:underline font-semibold"
          >
            {t.auth.createOneNow}
          </Link>
        </Text>
      </div>
    </div>
  );
}
