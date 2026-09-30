"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Search, User as UserIcon, MessageSquare, Crown, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Text } from "@/_components/Text";
import { useLanguage } from "@/context/LanguageContext";
import { useGetAllUsers } from "@/_features/user/hooks";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: any) => void;
  title?: string;
  description?: string;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onSelectUser,
  title,
  description,
}: NewChatModalProps) {
  const { t, isArabic } = useLanguage();
  const { data: currentUser } = useGetAuthMeQuery();
  const { data: allUsersData, isLoading } = useGetAllUsers();
  const [searchQuery, setSearchQuery] = useState("");

  const usersList: any[] = useMemo(() => {
    const raw = Array.isArray(allUsersData)
      ? allUsersData
      : (allUsersData as any)?.users || [];
    return raw.filter((u: any) => u._id !== currentUser?._id);
  }, [allUsersData, currentUser]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return usersList;
    return usersList.filter((u: any) => {
      const name = (u.fullName || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      return name.includes(q) || username.includes(q);
    });
  }, [searchQuery, usersList]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-bgSecondary border border-borderPrimary/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-borderPrimary/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <Text as="h3" size="default" font="bold" color="primary">
                  {title || t.chat.newChat}
                </Text>
                <Text as="p" size="xs" color="secondary">
                  {description || (isArabic ? "اختر شخصاً لبدء المحادثة معه" : "Select someone to start chatting with")}
                </Text>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-bgPrimary/80 text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-borderPrimary/40">
            <div className="relative">
              <Search className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.chat.searchConversations}
                className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 text-xs sm:text-sm rounded-xl bg-bgPrimary/80 border border-borderPrimary/60 text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 divide-y divide-borderPrimary/20">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-textSecondary">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                {isArabic ? "جاري التحميل..." : "Loading users..."}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-textSecondary">
                <UserIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                {t.chat.noUsersFound}
              </div>
            ) : (
              filteredUsers.map((u: any) => {
                const displayName = u.fullName || u.username;
                const formattedUsername = u.username?.startsWith("@")
                  ? u.username
                  : `@${u.username}`;

                return (
                  <button
                    key={u._id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-bgPrimary/60 transition-all text-start group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.profilePicture?.url ? (
                        <img
                          src={u.profilePicture.url}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Text
                            as="span"
                            size="xs"
                            font="bold"
                            color="primary"
                            className="truncate group-hover:text-primary transition-colors"
                          >
                            {displayName}
                          </Text>
                          {u.role === "SuperAdmin" ? (
                            <Crown className="h-3 w-3 text-amber-400 shrink-0 inline" />
                          ) : u.role === "Admin" ? (
                            <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-1 rounded border border-amber-500/20 shrink-0">
                              {t.admin.admin}
                            </span>
                          ) : null}
                        </div>
                        <Text
                          as="span"
                          size="xs"
                          color="secondary"
                          className="block truncate text-[11px]"
                        >
                          {formattedUsername}
                        </Text>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}
