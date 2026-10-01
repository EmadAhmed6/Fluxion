"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/_components/Text";
import { useLanguage } from "@/context/LanguageContext";

interface BlockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  isPending?: boolean;
}

export default function BlockConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  isPending = false,
}: BlockConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const { t, isArabic } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modalTitle = title || t.profile.confirmBlockTitle || (isArabic ? "حظر المستخدم" : "Block User");
  const modalDescription =
    description ||
    t.profile.confirmBlockMessage ||
    (isArabic
      ? "هل أنت متأكد من حظر هذا المستخدم؟ لن يتمكن من رؤية بروفايلك أو بوستاتك أو إرسال رسائل لك."
      : "Are you sure you want to block this user? They will not be able to view your profile, posts, or send you messages.");
  const modalConfirmText = confirmText || t.profile.blockUser || (isArabic ? "حظر" : "Block");

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-bgSecondary border border-borderPrimary rounded-3xl p-6 md:p-8 shadow-2xl z-10 overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 ltr:right-4 rtl:left-4 p-2 rounded-xl text-textSecondary hover:text-textPrimary hover:bg-bgPrimary transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Block Icon Banner */}
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-5">
              <Ban className="h-7 w-7" />
            </div>

            {/* Title & Description */}
            <Text as="h3" size="xl" font="bold" color="primary" className="mb-2">
              {modalTitle}
            </Text>
            <Text
              as="p"
              size="sm"
              color="secondary"
              className="leading-relaxed mb-6 text-xs md:text-sm"
            >
              {modalDescription}
            </Text>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-borderPrimary/40">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="rounded-xl border-borderPrimary px-4 text-xs font-semibold cursor-pointer"
              >
                <Text as="span" size="xs" font="semiBold" color="primary">
                  {isArabic ? "إلغاء" : "Cancel"}
                </Text>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onConfirm}
                disabled={isPending}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                <span>{modalConfirmText}</span>
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
