"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Plus, X } from "lucide-react";
import dynamic from "next/dynamic";
import { Theme, EmojiStyle, EmojiClickData } from "emoji-picker-react";

// Only the full EmojiPicker needs dynamic import (heavy, SSR-unsafe)
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="w-[340px] h-[380px] flex items-center justify-center bg-[#1f2c34] text-gray-400 text-xs">
      Loading Emojis...
    </div>
  ),
});

// Emoji font stack — ensures native high-quality color emoji rendering on every OS
const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

export interface EmojiReactionItem {
  id: string;
  emoji: string;
  name: string;
  nameAr?: string;
  glowColor: string;
  ringColor: string;
}

// 6 WhatsApp-style quick reaction emojis
export const WHATSAPP_EMOJIS: EmojiReactionItem[] = [
  {
    id: "like",
    emoji: "👍",
    name: "Thumbs Up",
    nameAr: "إعجاب",
    glowColor: "rgba(24, 119, 242, 0.65)",
    ringColor: "ring-blue-500",
  },
  {
    id: "love",
    emoji: "❤️",
    name: "Red Heart",
    nameAr: "حب",
    glowColor: "rgba(239, 68, 68, 0.75)",
    ringColor: "ring-red-500",
  },
  {
    id: "haha",
    emoji: "😂",
    name: "Laughing",
    nameAr: "ضحك",
    glowColor: "rgba(245, 158, 11, 0.75)",
    ringColor: "ring-amber-400",
  },
  {
    id: "wow",
    emoji: "😮",
    name: "Surprised",
    nameAr: "واو",
    glowColor: "rgba(245, 158, 11, 0.75)",
    ringColor: "ring-amber-400",
  },
  {
    id: "sad",
    emoji: "😢",
    name: "Crying",
    nameAr: "حزن",
    glowColor: "rgba(59, 130, 246, 0.75)",
    ringColor: "ring-blue-400",
  },
  {
    id: "pray",
    emoji: "🙏",
    name: "Folded Hands",
    nameAr: "شكراً",
    glowColor: "rgba(245, 158, 11, 0.75)",
    ringColor: "ring-amber-400",
  },
];

export interface WhatsAppReactionPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReaction: (reactionTypeOrEmoji: string) => void;
  selectedReaction?: string | null;
  align?: "left" | "right" | "center";
  isArabic?: boolean;
  anchorRef?: { current: HTMLElement | null };
}

export function WhatsAppReactionPicker({
  isOpen,
  onClose,
  onSelectReaction,
  selectedReaction,
  align = "left",
  isArabic = false,
  anchorRef,
}: WhatsAppReactionPickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isFullPickerOpen, setIsFullPickerOpen] = useState(false);
  const [position, setPosition] = useState({ left: 8, bottom: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Render the floating picker in the document layer so the chat scroll area
  // cannot clip it. Keep it anchored to the reaction button while scrolling.
  useEffect(() => {
    if (!isOpen || !anchorRef?.current) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const pickerWidth = containerRef.current?.offsetWidth || 336;
      const rawLeft =
        align === "right"
          ? rect.right - pickerWidth
          : align === "center"
            ? rect.left + (rect.width - pickerWidth) / 2
            : rect.left;
      const maxLeft = Math.max(8, window.innerWidth - pickerWidth - 8);

      setPosition({
        left: Math.min(Math.max(8, rawLeft), maxLeft),
        bottom: window.innerHeight - rect.top + 12,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, align, anchorRef]);

  // Close reaction picker on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen && !isFullPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isFullPickerOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (isFullPickerOpen) {
          setIsFullPickerOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullPickerOpen, onClose]);

  // Framer Motion Variants
  const pillVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.65,
      y: 16,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 450,
        damping: 25,
        staggerChildren: 0.04,
        delayChildren: 0.02,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.65,
      y: 16,
      transition: {
        duration: 0.15,
        ease: "easeOut",
      },
    },
  };

  const emojiItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.3, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 480,
        damping: 22,
      },
    },
  };

  return typeof document === "undefined" ? null : createPortal((
    <>
      {/* ─── Floating Reaction Pill ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            variants={pillVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ left: position.left, bottom: position.bottom }}
            className="fixed z-[1000] flex items-center gap-1 px-2.5 py-1.5 bg-[#242526] border border-[#393a3b] rounded-full shadow-2xl shadow-black/80 backdrop-blur-md select-none origin-bottom"
          >
            {/* 6 Unicode Emoji Buttons */}
            {WHATSAPP_EMOJIS.map((item) => {
              const isHovered = hoveredId === item.id;
              const isSelected =
                selectedReaction === item.id;

              return (
                <div
                  key={item.id}
                  className="relative flex items-center justify-center"
                >
                  <motion.button
                    type="button"
                    variants={emojiItemVariants}
                    animate={{
                      y: isHovered ? -8 : 0,
                      scale: isHovered ? 1.35 : 1,
                    }}
                    whileTap={{ scale: 0.85 }}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 18,
                    }}
                    onClick={() => {
                      onSelectReaction(item.id);
                      onClose();
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`relative w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-colors duration-200 ${
                      isSelected
                        ? `ring-2 ${item.ringColor} bg-white/20 z-10`
                        : isHovered
                        ? `ring-2 ${item.ringColor} bg-white/10 z-20`
                        : "hover:bg-white/10"
                    }`}
                    style={{
                      boxShadow: isHovered
                        ? `0 0 20px ${item.glowColor}`
                        : undefined,
                    }}
                    title={isArabic ? item.nameAr || item.name : item.name}
                  >
                    {/* Emoji Character — explicit size, font, and color */}
                    <span
                      className="text-[28px] leading-none select-none pointer-events-none drop-shadow-sm"
                      style={{ fontFamily: EMOJI_FONT }}
                      role="img"
                      aria-label={item.name}
                    >
                      {item.emoji}
                    </span>
                  </motion.button>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.85 }}
                        animate={{ opacity: 1, y: -2, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.85 }}
                        transition={{ duration: 0.12 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-full bg-[#18191a] text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-xl border border-[#393a3b] z-[1001]"
                      >
                        {isArabic ? item.nameAr || item.name : item.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* ─── "+" Button for Full Emoji Picker ─── */}
            <div className="relative flex items-center justify-center ltr:ml-0.5 rtl:mr-0.5">
              <motion.button
                type="button"
                variants={emojiItemVariants}
                whileHover={{
                  scale: 1.2,
                  y: -5,
                  transition: {
                    type: "spring",
                    stiffness: 450,
                    damping: 18,
                  },
                }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setIsFullPickerOpen(true)}
                onMouseEnter={() => setHoveredId("more")}
                onMouseLeave={() => setHoveredId(null)}
                className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer select-none"
                title={isArabic ? "المزيد من التفاعلات" : "More reactions"}
              >
                <Plus className="w-5 h-5" />
              </motion.button>

              {/* Plus Tooltip */}
              <AnimatePresence>
                {hoveredId === "more" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.85 }}
                    animate={{ opacity: 1, y: -2, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.85 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-full bg-[#18191a] text-white text-[11px] font-semibold whitespace-nowrap pointer-events-none shadow-xl border border-[#393a3b] z-[1001]"
                  >
                    {isArabic ? "المزيد" : "More"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Full Emoji Picker Modal ─── */}
      <AnimatePresence>
        {isFullPickerOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="relative bg-[#1f2c34] border border-[#393a3b] rounded-3xl p-3 sm:p-4 shadow-2xl overflow-hidden max-w-sm w-full"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-white/10 mb-3">
                <span className="text-sm font-bold text-white tracking-wide">
                  {isArabic ? "اختر تفاعلاً" : "Choose a reaction"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFullPickerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Full Emoji Picker */}
              <div className="flex justify-center w-full rounded-2xl overflow-hidden bg-[#111b21] p-1 border border-white/5">
                <EmojiPicker
                  theme={Theme.DARK}
                  emojiStyle={EmojiStyle.APPLE}
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    onSelectReaction(emojiData.emoji);
                    setIsFullPickerOpen(false);
                    onClose();
                  }}
                  lazyLoadEmojis={true}
                  searchPlaceHolder={
                    isArabic ? "بحث عن إيموجي..." : "Search emojis..."
                  }
                  width="100%"
                  height={380}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  ), document.body);
}
