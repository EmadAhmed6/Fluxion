"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { SmilePlus } from "lucide-react";
import { ChatMessage, ChatUser } from "@/_features/chat";
import { useLanguage } from "@/context/LanguageContext";
import {
  WhatsAppReactionPicker,
  WHATSAPP_EMOJIS,
} from "@/components/WhatsAppReactionPicker";

// Emoji font stack for consistent native color emoji rendering
const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

// Known quick-reaction IDs → emoji character mapping
const KNOWN_REACTIONS: Record<string, { emoji: string; labelKey: string }> = {
  like: { emoji: "👍", labelKey: "reactionLike" },
  love: { emoji: "❤️", labelKey: "reactionLove" },
  care: { emoji: "🥰", labelKey: "reactionCare" },
  haha: { emoji: "😂", labelKey: "reactionHaha" },
  wow: { emoji: "😮", labelKey: "reactionWow" },
  sad: { emoji: "😢", labelKey: "reactionSad" },
  angry: { emoji: "😡", labelKey: "reactionAngry" },
  pray: { emoji: "🙏", labelKey: "reactionThanks" },
  eggs: { emoji: "🥚", labelKey: "reactionEggs" },
};

/**
 * Resolves any reaction type string into a displayable emoji character and label key.
 * Handles: known IDs ("like"), WHATSAPP_EMOJIS entries, or raw emoji characters ("😍").
 */
function resolveReaction(type: string): {
  emoji: string;
  labelKey: string | null;
} {
  // 1. Known quick-reaction ID
  const known = KNOWN_REACTIONS[type];
  if (known) return known;

  // 2. Match against WHATSAPP_EMOJIS list by id
  const waMatch = WHATSAPP_EMOJIS.find((item) => item.id === type);
  if (waMatch) return { emoji: waMatch.emoji, labelKey: null };

  // 3. Raw emoji character from the full picker — use as-is
  return { emoji: type, labelKey: null };
}

export type ReactionType = string;

interface MessageReactionsProps {
  message: ChatMessage;
  currentUserId: string;
  isMe: boolean;
  onReact: (reactionType: string) => void;
  isPending?: boolean;
}

export function MessageReactions({
  message,
  currentUserId,
  isMe,
  onReact,
  isPending = false,
}: MessageReactionsProps) {
  const { t, isArabic } = useLanguage();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hover open delay for desktop UX
  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsPickerOpen(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsPickerOpen(false);
    }, 280);
  };

  const reactions = message.reactions || [];

  const userCurrentReaction = useMemo(() => {
    return reactions.find((r) => {
      const userId =
        typeof r.user === "object" && r.user !== null
          ? (r.user as ChatUser)._id
          : r.user;
      return userId === currentUserId;
    })?.type;
  }, [reactions, currentUserId]);

  const handleSelectReaction = (typeOrEmoji: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsPickerOpen(false);
    onReact(typeOrEmoji);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex items-center select-none"
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsPickerOpen((prev) => !prev)}
        disabled={isPending}
        className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
          isPickerOpen
            ? "bg-primary/20 text-primary scale-110"
            : "hover:bg-primary/10 text-textSecondary hover:text-primary opacity-0 group-hover:opacity-100"
        }`}
        title={t.chat.react}
      >
        <SmilePlus className="h-4 w-4" />
      </button>

      {/* Floating WhatsApp Reaction Picker */}
      <WhatsAppReactionPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectReaction={handleSelectReaction}
        selectedReaction={userCurrentReaction}
        align={isMe ? "right" : "left"}
        isArabic={isArabic}
        anchorRef={containerRef}
      />
    </div>
  );
}

interface ReactionBadgesProps {
  message: ChatMessage;
  currentUserId: string;
  isMe: boolean;
  onReact: (reactionType: string) => void;
  isPending?: boolean;
}

export function ReactionBadges({
  message,
  currentUserId,
  isMe,
  onReact,
  isPending = false,
}: ReactionBadgesProps) {
  const { t } = useLanguage();
  const [tooltipType, setTooltipType] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 118, top: 0 });
  const tooltipAnchorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateTooltipPosition = () => {
    const anchor = tooltipAnchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current?.offsetWidth || 220;
    const halfWidth = tooltipWidth / 2;
    const center = rect.left + rect.width / 2;
    setTooltipPosition({
      left: Math.min(
        Math.max(8 + halfWidth, center),
        window.innerWidth - 8 - halfWidth,
      ),
      top: rect.top - 8,
    });
  };

  useEffect(() => {
    if (!tooltipType) return;

    updateTooltipPosition();
    window.addEventListener("resize", updateTooltipPosition);
    window.addEventListener("scroll", updateTooltipPosition, true);
    return () => {
      window.removeEventListener("resize", updateTooltipPosition);
      window.removeEventListener("scroll", updateTooltipPosition, true);
    };
  }, [tooltipType]);

  const reactions = message.reactions || [];

  // Group reactions by type — stores full user objects for avatar/name rendering
  const grouped = useMemo(() => {
    if (!reactions || reactions.length === 0) return [];

    const map = new Map<
      string,
      {
        count: number;
        users: { name: string; avatar?: string; isSelf: boolean }[];
        hasReacted: boolean;
      }
    >();

    for (const r of reactions) {
      const type = r.type;
      const userObj =
        typeof r.user === "object" && r.user !== null
          ? (r.user as ChatUser)
          : null;
      const userId = userObj ? userObj._id : (r.user as string);
      const isSelf = userId === currentUserId;
      const userName = isSelf
        ? t.chat.you
        : userObj?.fullName || userObj?.username || "User";
      const avatar = userObj?.profilePicture?.url;

      if (!map.has(type)) {
        map.set(type, { count: 0, users: [], hasReacted: false });
      }
      const entry = map.get(type)!;
      entry.count += 1;
      entry.users.push({ name: userName, avatar, isSelf });
      if (isSelf) {
        entry.hasReacted = true;
      }
    }

    return Array.from(map.entries()).map(([type, data]) => {
      const resolved = resolveReaction(type);
      const label = resolved.labelKey
        ? (t.chat as any)[resolved.labelKey] || type
        : type;

      return {
        type,
        emoji: resolved.emoji,
        label,
        count: data.count,
        users: data.users,
        hasReacted: data.hasReacted,
      };
    });
  }, [reactions, currentUserId, t]);

  if (grouped.length === 0) return null;

  const activeTooltip = grouped.find((item) => item.type === tooltipType);

  const showTooltip = (type: string, anchor: HTMLDivElement) => {
    if (tooltipHideTimerRef.current) clearTimeout(tooltipHideTimerRef.current);
    tooltipAnchorRef.current = anchor;
    setTooltipType(type);
    requestAnimationFrame(updateTooltipPosition);
  };

  const hideTooltip = () => {
    if (tooltipHideTimerRef.current) clearTimeout(tooltipHideTimerRef.current);
    tooltipHideTimerRef.current = setTimeout(() => setTooltipType(null), 120);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 mt-1.5 select-none ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {grouped.map((item) => {
        return (
          <div
            key={item.type}
            className="relative hover:z-[1000]"
            onMouseEnter={(event) => {
              showTooltip(item.type, event.currentTarget);
            }}
            onMouseLeave={hideTooltip}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onReact(item.type)}
              disabled={isPending}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-xs border ${
                item.hasReacted
                  ? "bg-primary/20 border-primary/50 text-primary ring-1 ring-primary/30"
                  : "bg-[#242526] hover:bg-[#3A3B3C] border-[#393A3B] text-gray-200"
              }`}
            >
              {/* Emoji character with explicit size */}
              <span
                className="text-sm leading-none shrink-0"
                style={{ fontFamily: EMOJI_FONT }}
              >
                {item.emoji}
              </span>
              {item.count > 1 && <span>{item.count}</span>}
            </motion.button>

          </div>
        );
      })}
      {activeTooltip && typeof document !== "undefined" &&
        createPortal(
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.12 }}
            style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
            className="fixed -translate-x-1/2 -translate-y-full px-3 py-2.5 rounded-2xl bg-[#18191A] text-white text-[11px] shadow-xl z-[1001] pointer-events-none border border-[#393A3B] min-w-[180px] max-w-[calc(100vw-16px)]"
          >
            <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
              {activeTooltip.users.slice(0, 5).map((user, idx) => (
                <div key={idx} className="flex items-center gap-2.5 whitespace-nowrap">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 ring-1 ring-white/10">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className={`text-xs font-semibold truncate max-w-[110px] ${user.isSelf ? "text-white font-bold" : "text-gray-100"}`}>
                      {user.isSelf ? "You" : user.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {user.isSelf ? "Click to remove" : "Reacted"}
                    </span>
                  </div>
                  <span className="text-base ml-auto shrink-0 leading-none" style={{ fontFamily: EMOJI_FONT }}>
                    {activeTooltip.emoji}
                  </span>
                </div>
              ))}
              {activeTooltip.users.length > 5 && (
                <span className="text-[10px] text-gray-400 text-center pt-1">
                  +{activeTooltip.users.length - 5} more
                </span>
              )}
            </div>
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
