"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/_components/Navbar";
import {
  useGetConversations,
  useGetMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useMarkAsRead,
  useReactMessage,
  ChatUser,
  ChatMessage,
  ChatConversation,
} from "@/_features/chat";
import { useGetAuthMeQuery } from "@/_features/auth/hooks";
import { useGetUserProfile } from "@/_features/user/hooks";
import { Text } from "@/_components/Text";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import ImageModal from "@/_components/ImageModal";
import DeleteConfirmModal from "@/_components/DeleteConfirmModal";
import NewChatModal from "./NewChatModal";
import { MessageReactions, ReactionBadges } from "./MessageReactions";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Image as ImageIcon,
  X,
  Trash2,
  Pencil,
  Ban,
  ArrowLeft,
  ArrowRight,
  User as UserIcon,
  Crown,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const { t, isArabic } = useLanguage();

  const { data: currentUser } = useGetAuthMeQuery();
  const { data: conversations = [], isLoading: isConversationsLoading } =
    useGetConversations();

  // Active user to chat with
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [deleteModalMessageId, setDeleteModalMessageId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If queryUserId is provided in URL, fetch their user profile
  const { data: directTargetUser } = useGetUserProfile(queryUserId || "");

  const activeUserId = activeUser?._id || "";
  const { data: messages = [], isLoading: isMessagesLoading } =
    useGetMessages(activeUserId);

  const sendMessageMutation = useSendMessage();
  const editMessageMutation = useEditMessage();
  const deleteMessageMutation = useDeleteMessage();
  const markAsReadMutation = useMarkAsRead();
  const reactMessageMutation = useReactMessage();

  // Handle setting active user from URL query param or first conversation
  useEffect(() => {
    if (queryUserId && directTargetUser) {
      setActiveUser({
        _id: directTargetUser._id,
        username: directTargetUser.username || "",
        fullName: directTargetUser.fullName || directTargetUser.username || "",
        profilePicture: directTargetUser.profilePicture,
        role: directTargetUser.role,
        jobTitle: directTargetUser.jobTitle,
        bio: (directTargetUser as any).bio,
      });
    }
  }, [queryUserId, directTargetUser]);


  // Mark as read when active user changes
  useEffect(() => {
    if (activeUserId) {
      markAsReadMutation.mutate(activeUserId);
    }
  }, [activeUserId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesLoading]);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
    e.target.value = "";
  };

  const handleRemoveSelectedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessage(msg);
    setMessageText(msg.message || "");
    handleRemoveSelectedImage();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeUserId) return;

    const trimmed = messageText.trim();

    // If editing existing message
    if (editingMessage) {
      if (!trimmed) return;
      const targetMsg = editingMessage;
      setEditingMessage(null);
      setMessageText("");
      try {
        await editMessageMutation.mutateAsync({
          messageId: targetMsg._id,
          message: trimmed,
        });
      } catch {
        setEditingMessage(targetMsg);
        setMessageText(trimmed);
      }
      return;
    }

    if (!trimmed && !selectedImage) return;

    const currentMsg = trimmed;
    const currentImg = selectedImage;

    // Reset inputs immediately for responsive UX
    setMessageText("");
    handleRemoveSelectedImage();

    try {
      await sendMessageMutation.mutateAsync({
        recipientId: activeUserId,
        message: currentMsg,
        image: currentImg,
      });
    } catch {
      // Re-fill on failure
      setMessageText(currentMsg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Escape" && editingMessage) {
      handleCancelEdit();
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = (c.user?.fullName || "").toLowerCase();
      const username = (c.user?.username || "").toLowerCase();
      const lastMsg = (c.lastMessage?.message || "").toLowerCase();
      return name.includes(q) || username.includes(q) || lastMsg.includes(q);
    });
  }, [conversations, searchQuery]);

  const BackIcon = isArabic ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 flex flex-col">
        {/* Chat Wrapper Container */}
        <div className="flex-1 bg-bgSecondary/60 border border-borderPrimary/50 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row min-h-[75vh] max-h-[85vh]">
          {/* Left Panel: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:ltr:border-r md:rtl:border-l border-borderPrimary/40 flex flex-col ${
              activeUser ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Conversations Header */}
            <div className="p-4 border-b border-borderPrimary/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <Text as="h2" size="default" font="extraBold" color="primary">
                  {t.chat.chats}
                </Text>
              </div>

              <Button
                onClick={() => setIsNewChatModalOpen(true)}
                size="sm"
                className="rounded-xl text-xs gap-1.5 bg-primary hover:bg-primaryHover text-white cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>{t.chat.newChat}</span>
              </Button>
            </div>

            {/* Search Box */}
            <div className="p-3 border-b border-borderPrimary/30">
              <div className="relative">
                <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textSecondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.chat.searchConversations}
                  className="w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2 text-xs rounded-xl bg-bgPrimary/80 border border-borderPrimary/40 text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Conversations Feed */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isConversationsLoading ? (
                <div className="py-16 text-center text-xs text-textSecondary">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                  <span>{isArabic ? "جاري التحميل..." : "Loading messages..."}</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="py-16 text-center px-4 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <Text as="p" size="xs" font="bold" color="primary">
                      {t.chat.noConversations}
                    </Text>
                    <Text as="p" size="xs" color="secondary" className="mt-1 text-[11px]">
                      {t.chat.noConversationsDesc}
                    </Text>
                  </div>
                  <Button
                    onClick={() => setIsNewChatModalOpen(true)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs cursor-pointer border-borderPrimary hover:border-primary/40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t.chat.newChat}</span>
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conv: ChatConversation) => {
                  const target = conv.user;
                  const isSelected = activeUserId === target?._id;
                  const displayName = target?.fullName || target?.username;
                  const isSenderMe =
                    typeof conv.lastMessage?.sender === "string"
                      ? conv.lastMessage.sender === currentUser?._id
                      : conv.lastMessage?.sender?._id === currentUser?._id;

                  const timeFormatted = conv.lastMessage?.createdAt
                    ? new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                        isArabic ? "ar-EG" : "en-US",
                        { hour: "2-digit", minute: "2-digit" },
                      )
                    : "";

                  return (
                    <button
                      key={target?._id}
                      onClick={() => {
                        setActiveUser(target);
                        router.push(`/chat?userId=${target._id}`);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-start cursor-pointer group ${
                        isSelected
                          ? "bg-primary/15 text-primary border border-primary/30 shadow-xs"
                          : "hover:bg-bgPrimary/60 border border-transparent"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {target?.profilePicture?.url ? (
                          <img
                            src={target.profilePicture.url}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                            className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            <UserIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Info & Last Message */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Text
                              as="span"
                              size="xs"
                              font="bold"
                              color="primary"
                              className="truncate"
                            >
                              {displayName}
                            </Text>
                            {target?.role === "SuperAdmin" && (
                              <Crown className="h-3 w-3 text-amber-400 shrink-0 inline" />
                            )}
                          </div>
                          <span suppressHydrationWarning className="text-[10px] text-textSecondary font-medium shrink-0">
                            {timeFormatted}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] text-textSecondary truncate max-w-[180px]">
                            {isSenderMe && (
                              <span className="font-semibold text-primary/80 ltr:mr-1 rtl:ml-1">
                                {t.chat.you}:
                              </span>
                            )}
                            {conv.lastMessage?.isDeleted ? (
                              <span className="italic opacity-80">
                                🚫 {t.chat.messageDeleted}
                              </span>
                            ) : (() => {
                                const raw = (conv.lastMessage?.message || "").trim();
                                const isPhotoAuto =
                                  raw === "📷 Photo" ||
                                  raw === "Photo" ||
                                  raw === "📷";
                                const clean = isPhotoAuto ? "" : raw;
                                if (clean) return clean;
                                if (conv.lastMessage?.imageUrl)
                                  return "📷 " + t.chat.photo;
                                return "";
                              })()}
                          </p>

                          {conv.unreadCount > 0 && (
                            <span className="h-5 min-w-[20px] px-1 rounded-full bg-primary text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat View */}
          <div
            className={`flex-1 flex flex-col bg-bgPrimary/30 ${
              !activeUser ? "hidden md:flex" : "flex"
            }`}
          >
            {activeUser ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 sm:p-4 border-b border-borderPrimary/40 bg-bgSecondary/40 backdrop-blur-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => {
                        setActiveUser(null);
                        router.push("/chat");
                      }}
                      className="p-2 rounded-xl hover:bg-bgSecondary md:hidden text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                      title={t.chat.back}
                    >
                      <BackIcon className="h-5 w-5" />
                    </button>

                    <Link
                      href={`/profile/${activeUser._id}`}
                      className="relative shrink-0 group"
                    >
                      {activeUser.profilePicture?.url ? (
                        <img
                          src={activeUser.profilePicture.url}
                          alt={activeUser.fullName || activeUser.username}
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary transition-all"
                        />
                      ) : (
                        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          <UserIcon className="h-5 w-5" />
                        </div>
                      )}
                    </Link>


                    <div className="min-w-0">
                      <Link
                        href={`/profile/${activeUser._id}`}
                        className="flex items-center gap-1.5 group"
                      >
                        <Text
                          as="h3"
                          size="sm"
                          font="bold"
                          color="primary"
                          className="truncate group-hover:text-primary transition-colors"
                        >
                          {activeUser.fullName || activeUser.username}
                        </Text>
                        {activeUser.role === "SuperAdmin" ? (
                          <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0 inline" />
                        ) : activeUser.role === "Admin" ? (
                          <span className="text-[9px] font-extrabold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                            {t.admin.admin}
                          </span>
                        ) : null}
                      </Link>
                      <Text
                        as="p"
                        size="xs"
                        color="secondary"
                        className="text-[11px] truncate"
                      >
                        @{activeUser.username}
                      </Text>
                    </div>
                  </div>

                  <Link href={`/profile/${activeUser._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs cursor-pointer border-borderPrimary/60 hover:border-primary/50"
                    >
                      {t.nav.viewProfile}
                    </Button>
                  </Link>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {isMessagesLoading ? (
                    <div className="py-20 text-center text-xs text-textSecondary">
                      <Loader2 className="h-7 w-7 animate-spin text-primary mx-auto mb-2" />
                      <span>{isArabic ? "جاري تحميل الرسائل..." : "Loading messages..."}</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-20 text-center px-4 space-y-3">
                      <div className="h-14 w-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
                        <Sparkles className="h-7 w-7" />
                      </div>
                      <Text as="h4" size="sm" font="bold" color="primary">
                        {t.chat.startConversationWith}{" "}
                        {activeUser.fullName || activeUser.username}!
                      </Text>
                      <Text as="p" size="xs" color="secondary" className="max-w-xs mx-auto">
                        {isArabic
                          ? "ابعت رسالة أو صورة وابدأوا الحديث سوا."
                          : "Say hello, ask a question, or share an idea."}
                      </Text>
                    </div>
                  ) : (
                    messages.map((msg: ChatMessage) => {
                      const isMe =
                        typeof msg.sender === "string"
                          ? msg.sender === currentUser?._id
                          : msg.sender?._id === currentUser?._id;

                      const timeFormatted = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString(
                            isArabic ? "ar-EG" : "en-US",
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : "";

                      const isEdited = Boolean(msg.isEdited);

                      const rawMessage = (msg.message || "").trim();
                      const hasImage = Boolean(msg.imageUrl);
                      const isAutoPhotoText =
                        rawMessage === "📷 Photo" ||
                        rawMessage === "Photo" ||
                        rawMessage === "📷" ||
                        rawMessage.toLowerCase() === "photo";
                      const displayMessage =
                        isAutoPhotoText && hasImage ? "" : rawMessage;
                      const hasText = displayMessage.length > 0;
                      const isImageOnly = hasImage && !hasText;

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-1.5 group relative ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {/* Other User Avatar */}
                          {!isMe && (
                            <div className="shrink-0 mb-1">
                              {typeof msg.sender !== "string" &&
                              msg.sender?.profilePicture?.url ? (
                                <img
                                  src={msg.sender.profilePicture.url}
                                  alt="Avatar"
                                  referrerPolicy="no-referrer"
                                  className="h-7 w-7 rounded-full object-cover ring-1 ring-primary/20"
                                />
                              ) : (
                                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                                  <UserIcon className="h-3.5 w-3.5" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons on Hover for Sent Messages (React, Edit & Delete) */}
                          {isMe && !msg.isDeleted && (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity mb-1 shrink-0">
                              <MessageReactions
                                message={msg}
                                currentUserId={currentUser?._id || ""}
                                isMe={isMe}
                                onReact={(reactionType) =>
                                  reactMessageMutation.mutate({
                                    messageId: msg._id,
                                    reactionType,
                                  })
                                }
                                isPending={reactMessageMutation.isPending}
                              />
                              {hasText && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(msg)}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-textSecondary hover:text-primary transition-colors cursor-pointer"
                                  title={t.chat.editMessage}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setDeleteModalMessageId(msg._id)}
                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-textSecondary hover:text-rose-500 transition-colors cursor-pointer"
                                title={t.chat.deleteMessage}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Message Content Container + Reactions */}
                          <div
                            className={`flex flex-col max-w-[85%] sm:max-w-md ${
                              isMe ? "items-end" : "items-start"
                            }`}
                          >
                            {msg.isDeleted ? (
                              /* Deleted Message Placeholder (WhatsApp Style) */
                              <div
                                className={`w-fit flex items-center gap-2 rounded-2xl px-3.5 py-1.5 shadow-xs border select-none transition-all ${
                                  isMe
                                    ? "bg-bgSecondary/50 border-borderPrimary/40 text-textSecondary/80 ltr:rounded-br-xs rtl:rounded-bl-xs"
                                    : "bg-bgSecondary/35 border-borderPrimary/30 text-textSecondary/80 ltr:rounded-bl-xs rtl:rounded-br-xs"
                                }`}
                              >
                                <Ban className="h-3.5 w-3.5 text-textSecondary/60 shrink-0" />
                                <span className="italic text-xs sm:text-[13px] text-textSecondary/80">
                                  {t.chat.messageDeleted}
                                </span>
                                <span suppressHydrationWarning className="text-[10px] text-textSecondary/50 shrink-0 ltr:ml-2 rtl:mr-2">
                                  {timeFormatted}
                                </span>
                              </div>
                            ) : isImageOnly ? (
                              /* Standalone Image: Natural sizing, NO outer background, NO borders */
                              <div className="relative group/img overflow-hidden rounded-2xl cursor-pointer max-w-[260px] sm:max-w-[320px] shadow-sm">
                                <img
                                  src={msg.imageUrl}
                                  alt="Attachment"
                                  className="w-full max-h-80 object-cover rounded-2xl block hover:opacity-95 transition-opacity"
                                  onClick={() =>
                                    setPreviewModalImage(msg.imageUrl || null)
                                  }
                                />
                                {/* Floating timestamp pill over image */}
                                <div className="absolute bottom-1.5 ltr:right-2 rtl:left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] flex items-center gap-1 shadow-xs pointer-events-none select-none">
                                  <span suppressHydrationWarning>{timeFormatted}</span>
                                  {isMe &&
                                    (msg.isRead ? (
                                      <CheckCheck className="h-3 w-3 text-white" />
                                    ) : (
                                      <Check className="h-3 w-3 text-white/80" />
                                    ))}
                                </div>
                              </div>
                            ) : (
                              /* Compact Message Bubble (Hugs content tightly like WhatsApp) */
                              <div
                                className={`w-fit rounded-2xl px-3 py-1.5 shadow-xs text-xs sm:text-[13px] leading-snug break-words transition-all ${
                                  isMe
                                    ? "bg-primary text-white ltr:rounded-br-xs rtl:rounded-bl-xs"
                                    : "bg-bgSecondary border border-borderPrimary/60 text-textPrimary ltr:rounded-bl-xs rtl:rounded-br-xs"
                                }`}
                              >
                                {/* If message also has image */}
                                {hasImage && (
                                  <div
                                    onClick={() =>
                                      setPreviewModalImage(msg.imageUrl || null)
                                    }
                                    className="cursor-pointer overflow-hidden rounded-xl mb-1.5 hover:opacity-95 transition-opacity"
                                  >
                                    <img
                                      src={msg.imageUrl}
                                      alt="Attachment"
                                      className="max-h-64 w-full object-cover rounded-xl block"
                                    />
                                  </div>
                                )}

                                {/* Text & Inline Status Footer */}
                                <div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-0.5">
                                  <p className="min-w-0 max-w-full font-medium leading-relaxed break-words whitespace-pre-wrap select-text">
                                    {displayMessage}
                                  </p>

                                  <div
                                    className={`flex items-center gap-1 text-[10px] shrink-0 pb-0.5 select-none ltr:ml-auto rtl:mr-auto ${
                                      isMe
                                        ? "text-white/85"
                                        : "text-textSecondary"
                                    }`}
                                  >
                                    {isEdited && (
                                      <span className="text-[9px] opacity-75 italic">
                                        {t.chat.edited}
                                      </span>
                                    )}
                                    <span suppressHydrationWarning>{timeFormatted}</span>
                                    {isMe &&
                                      (msg.isRead ? (
                                        <CheckCheck className="h-3.5 w-3.5 text-white" />
                                      ) : (
                                        <Check className="h-3.5 w-3.5 text-white/70" />
                                      ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Reaction Badges */}
                            {!msg.isDeleted && (
                              <ReactionBadges
                                message={msg}
                                currentUserId={currentUser?._id || ""}
                                isMe={isMe}
                                onReact={(reactionType) =>
                                  reactMessageMutation.mutate({
                                    messageId: msg._id,
                                    reactionType,
                                  })
                                }
                                isPending={reactMessageMutation.isPending}
                              />
                            )}
                          </div>

                          {/* Action Buttons on Hover for Received Messages (React) */}
                          {!isMe && !msg.isDeleted && (
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity mb-1 shrink-0">
                              <MessageReactions
                                message={msg}
                                currentUserId={currentUser?._id || ""}
                                isMe={isMe}
                                onReact={(reactionType) =>
                                  reactMessageMutation.mutate({
                                    messageId: msg._id,
                                    reactionType,
                                  })
                                }
                                isPending={reactMessageMutation.isPending}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Selected Image Preview Bar */}
                {imagePreviewUrl && (
                  <div className="px-4 py-2 bg-bgSecondary/90 border-t border-borderPrimary/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={imagePreviewUrl}
                        alt="Selected attachment"
                        className="h-12 w-12 rounded-xl object-cover border border-borderPrimary"
                      />
                      <div className="min-w-0">
                        <Text
                          as="p"
                          size="xs"
                          font="bold"
                          color="primary"
                          className="truncate"
                        >
                          {selectedImage?.name}
                        </Text>
                        <Text
                          as="p"
                          size="xs"
                          color="secondary"
                          className="text-[10px]"
                        >
                          {isArabic ? "مستعد للإرسال" : "Ready to send"}
                        </Text>
                      </div>
                    </div>

                    <button
                      onClick={handleRemoveSelectedImage}
                      className="p-1.5 rounded-full bg-bgPrimary hover:bg-rose-500/10 text-textSecondary hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Editing Message Banner */}
                {editingMessage && (
                  <div className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-lg bg-primary/20 text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-primary block text-[11px]">
                          {t.chat.editingMessage}
                        </span>
                        <p className="text-[11px] text-textSecondary truncate max-w-xs sm:max-w-md">
                          {editingMessage.message}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-full hover:bg-bgPrimary text-textSecondary hover:text-textPrimary transition-colors cursor-pointer"
                      title={t.chat.cancel}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-borderPrimary/40 bg-bgSecondary/60 backdrop-blur-md flex items-center gap-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Attachment Button (hidden when editing a message) */}
                  {!editingMessage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl text-textSecondary hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                      title={t.chat.uploadImage}
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                  )}

                  {/* Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      editingMessage
                        ? isArabic
                          ? "عدّل رسالتك..."
                          : "Edit your message..."
                        : t.chat.typeMessage
                    }
                    className="flex-1 py-2.5 px-4 text-xs sm:text-sm rounded-2xl bg-bgPrimary border border-borderPrimary/60 text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />

                  {/* Send / Save Button */}
                  <Button
                    type="submit"
                    disabled={
                      sendMessageMutation.isPending ||
                      editMessageMutation.isPending ||
                      (!messageText.trim() && !selectedImage)
                    }
                    size="sm"
                    className="rounded-2xl px-4 py-2.5 bg-primary hover:bg-primaryHover text-white cursor-pointer shadow-md disabled:opacity-50 transition-transform active:scale-95"
                  >
                    {sendMessageMutation.isPending ||
                    editMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingMessage ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4 rtl:rotate-180" />
                    )}
                  </Button>
                </form>
              </>
            ) : (
              /* Empty State when no conversation is chosen */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-linear-to-tr from-primary/20 via-primary/10 to-indigo-500/10 text-primary flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <Text as="h3" size="lg" font="extraBold" color="primary">
                    {t.chat.startChatPrompt}
                  </Text>
                  <Text as="p" size="xs" color="secondary" className="leading-relaxed">
                    {t.chat.startChatSubtext}
                  </Text>
                </div>
                <Button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="rounded-2xl text-xs gap-2 bg-primary hover:bg-primaryHover text-white cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t.chat.newChat}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Chat Picker Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={(u) => {
          setActiveUser(u);
          router.push(`/chat?userId=${u._id}`);
        }}
      />

      {/* Image Preview Modal */}
      {previewModalImage && (
        <ImageModal
          src={previewModalImage}
          alt="Chat Image Attachment"
          onClose={() => setPreviewModalImage(null)}
        />
      )}

      {/* Delete Message Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteModalMessageId}
        onClose={() => setDeleteModalMessageId(null)}
        onConfirm={async () => {
          if (deleteModalMessageId) {
            await deleteMessageMutation.mutateAsync(deleteModalMessageId);
            setDeleteModalMessageId(null);
          }
        }}
        title={t.chat.deleteMessage}
        description={t.chat.deleteConfirm}
        confirmText={t.chat.deleteMessage}
        isPending={deleteMessageMutation.isPending}
      />
    </div>
  );
}

export default function ChatPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bgPrimary flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

