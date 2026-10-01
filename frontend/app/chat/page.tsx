"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
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
  useForwardMessage,
  useSendAudioMessage,
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
import Tooltip from "@/_components/Tooltip";
import NewChatModal from "./NewChatModal";
import ChatAudioPlayer from "./ChatAudioPlayer";
import { MessageReactions, ReactionBadges } from "./MessageReactions";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  Paperclip,
  FileText,
  Download,
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
  Reply,
  Forward,
  Smile,
  Mic,
  Square,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import { appToast as toast } from "@/lib/toast";

type FileCategory = "pdf" | "document" | "spreadsheet" | "presentation" | "archive" | "audio" | "video" | "image" | "code" | "file";

const getFilePresentation = (fileName?: string, mimeType?: string) => {
  const extension = fileName?.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() || ""
    : "";
  const category: FileCategory =
    extension === "pdf" || mimeType === "application/pdf"
      ? "pdf"
      : ["doc", "docx", "odt", "rtf"].includes(extension) || mimeType?.includes("word")
        ? "document"
        : ["xls", "xlsx", "csv", "ods"].includes(extension) || mimeType?.includes("spreadsheet")
          ? "spreadsheet"
          : ["ppt", "pptx", "odp"].includes(extension) || mimeType?.includes("presentation")
            ? "presentation"
            : ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension) || mimeType?.includes("compressed")
              ? "archive"
                : ["mp3", "wav", "ogg", "opus", "m4a", "aac", "flac"].includes(extension) || mimeType?.startsWith("audio/")
                ? "audio"
                : ["mp4", "mov", "avi", "mkv", "webm"].includes(extension) || mimeType?.startsWith("video/")
                  ? "video"
                  : ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "heic"].includes(extension) || mimeType?.startsWith("image/")
                    ? "image"
                    : ["js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "html", "css", "json", "xml", "yml", "yaml", "sh"].includes(extension) || mimeType?.includes("json")
                      ? "code"
                      : "file";

  const presentation: Record<FileCategory, { label: string; tone: string }> = {
    pdf: { label: "PDF", tone: "text-rose-500 bg-rose-500/10" },
    document: { label: extension ? extension.toUpperCase() : "DOC", tone: "text-blue-500 bg-blue-500/10" },
    spreadsheet: { label: extension ? extension.toUpperCase() : "XLS", tone: "text-emerald-500 bg-emerald-500/10" },
    presentation: { label: extension ? extension.toUpperCase() : "PPT", tone: "text-orange-500 bg-orange-500/10" },
    archive: { label: extension ? extension.toUpperCase() : "ZIP", tone: "text-amber-500 bg-amber-500/10" },
    audio: { label: extension ? extension.toUpperCase() : "AUDIO", tone: "text-violet-500 bg-violet-500/10" },
    video: { label: extension ? extension.toUpperCase() : "VIDEO", tone: "text-pink-500 bg-pink-500/10" },
    image: { label: extension ? extension.toUpperCase() : "IMAGE", tone: "text-indigo-500 bg-indigo-500/10" },
    code: { label: extension ? extension.toUpperCase() : "CODE", tone: "text-cyan-500 bg-cyan-500/10" },
    file: { label: extension ? extension.toUpperCase() : "FILE", tone: "text-primary bg-primary/10" },
  };

  return { category, ...presentation[category] };
};

const formatFileSize = (bytes: number, isArabic: boolean) => {
  if (!bytes) return isArabic ? "0 بايت" : "0 B";
  const units = isArabic ? ["بايت", "ك.ب", "م.ب", "ج.ب"] : ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** unitIndex;
  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
};

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full animate-pulse rounded-xl bg-bgSecondary" />
  ),
});

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [deleteModalMessageId, setDeleteModalMessageId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const submitRecordingRef = useRef(false);
  const audioWaveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
  const forwardMessageMutation = useForwardMessage();
  const sendAudioMessageMutation = useSendAudioMessage();

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

  useEffect(() => {
    if (!isRecordingAudio) return;
    const timer = window.setInterval(
      () => setRecordingSeconds((seconds) => seconds + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [isRecordingAudio]);

  useEffect(() => {
    const canvas = audioWaveformCanvasRef.current;
    const analyser = audioAnalyserRef.current;
    const context = canvas?.getContext("2d");
    if (!isRecordingAudio || !canvas || !context || !analyser) return;

    const samples = new Uint8Array(analyser.fftSize);
    const barCount = 30;
    const barWidth = 3;
    const gap = 2;
    const fillColor = getComputedStyle(canvas).color;
    let animationFrame = 0;
    const drawWaveform = () => {
      analyser.getByteTimeDomainData(samples);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = fillColor;

      for (let index = 0; index < barCount; index += 1) {
        const sampleIndex = Math.floor((index / barCount) * samples.length);
        const amplitude = Math.abs((samples[sampleIndex] || 128) - 128) / 128;
        const height = Math.max(3, amplitude * canvas.height);
        const x = index * (barWidth + gap);
        context.fillRect(x, (canvas.height - height) / 2, barWidth, height);
      }

      animationFrame = requestAnimationFrame(drawWaveform);
    };

    animationFrame = requestAnimationFrame(drawWaveform);
    return () => cancelAnimationFrame(animationFrame);
  }, [isRecordingAudio]);

  useEffect(
    () => () => {
      const recorder = audioRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null;
        recorder.stop();
      }
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioSourceRef.current?.disconnect();
      audioSourceRef.current = null;
      audioAnalyserRef.current = null;
      const audioContext = audioContextRef.current;
      audioContextRef.current = null;
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close();
      }
    },
    [],
  );

  useEffect(
    () => () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    },
    [audioPreviewUrl],
  );

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMessagesLoading]);

  // Handle any file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      setSelectedFile(file);
      setImagePreviewUrl(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      );
    }
    e.target.value = "";
  };

  const handleRemoveSelectedFile = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedFile(null);
    setImagePreviewUrl(null);
  };

  const clearRecordedAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setRecordedAudio(null);
    setRecordingSeconds(0);
  };

  const closeAudioAnalysis = () => {
    audioSourceRef.current?.disconnect();
    audioSourceRef.current = null;
    audioAnalyserRef.current = null;
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }
  };

  const startAudioRecording = async () => {
    setIsEmojiPickerOpen(false);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error(
        isArabic
          ? "تسجيل الصوت غير مدعوم في هذا المتصفح."
          : "Audio recording is not supported by this browser.",
      );
      return;
    }

    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      discardRecordingRef.current = false;
      submitRecordingRef.current = false;

      try {
        const AudioContextConstructor =
          window.AudioContext ||
          (window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }).webkitAudioContext;
        if (AudioContextConstructor) {
          const audioContext = new AudioContextConstructor();
          await audioContext.resume();
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 128;
          const source = audioContext.createMediaStreamSource(stream);
          source.connect(analyser);
          audioContextRef.current = audioContext;
          audioAnalyserRef.current = analyser;
          audioSourceRef.current = source;
        }
      } catch {
        closeAudioAnalysis();
      }

      const recorder = new MediaRecorder(stream);
      audioRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        audioStreamRef.current?.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
        closeAudioAnalysis();
        audioRecorderRef.current = null;
        setIsRecordingAudio(false);

        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          return;
        }

        const audioBlob = new Blob(chunks, {
          type: recorder.mimeType || chunks[0]?.type || "audio/webm",
        });
        if (audioBlob.size > 0) {
          if (submitRecordingRef.current) {
            submitRecordingRef.current = false;
            void sendAudioMessageMutation
              .mutateAsync({
                recipientId: activeUserId,
                audio: audioBlob,
                replyTo: replyingTo?._id,
              })
              .then(() => setReplyingTo(null))
              .catch(() => {
                setRecordedAudio(audioBlob);
                setAudioPreviewUrl(URL.createObjectURL(audioBlob));
              });
            return;
          }
          setRecordedAudio(audioBlob);
          setAudioPreviewUrl(URL.createObjectURL(audioBlob));
        }
      };

      recorder.start();
      setRecordingSeconds(0);
      setIsRecordingAudio(true);
    } catch {
      stream?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
      closeAudioAnalysis();
      audioRecorderRef.current = null;
      setIsRecordingAudio(false);
      toast.error(
        isArabic
          ? "تعذر الوصول إلى الميكروفون. تحقق من صلاحية استخدامه."
          : "Could not access the microphone. Check its permission.",
      );
    }
  };

  const stopAudioRecording = () => {
    const recorder = audioRecorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
  };

  const cancelAudioRecording = () => {
    submitRecordingRef.current = false;
    const recorder = audioRecorderRef.current;
    if (recorder?.state === "recording") {
      discardRecordingRef.current = true;
      recorder.stop();
      return;
    }
    clearRecordedAudio();
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setReplyingTo(null);
    setEditingMessage(msg);
    setMessageText(msg.message || "");
    handleRemoveSelectedFile();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setReplyingTo(null);
    setMessageText("");
  };

  const handleStartReply = (msg: ChatMessage) => {
    if (editingMessage) setMessageText("");
    setEditingMessage(null);
    setReplyingTo(msg);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleForwardMessage = (msg: ChatMessage) => {
    setForwardingMessage(msg);
  };

  const handleSelectChatUser = async (user: ChatUser) => {
    if (!forwardingMessage) {
      setActiveUser(user);
      router.push(`/chat?userId=${user._id}`);
      return;
    }

    try {
      await forwardMessageMutation.mutateAsync({
        messageId: forwardingMessage._id,
        recipientId: user._id,
      });
    } catch {
      // The mutation displays the request error.
    } finally {
      setForwardingMessage(null);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeUserId) return;

    const trimmed = messageText.trim();

    if (isRecordingAudio) {
      submitRecordingRef.current = true;
      setIsEmojiPickerOpen(false);
      stopAudioRecording();
      return;
    }

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

    if (recordedAudio) {
      try {
        await sendAudioMessageMutation.mutateAsync({
          recipientId: activeUserId,
          audio: recordedAudio,
          replyTo: replyingTo?._id,
        });
        clearRecordedAudio();
        setReplyingTo(null);
      } catch {
        // Keep the recording available so it can be retried.
      }
      return;
    }

    if (!trimmed && !selectedFile) return;

    const currentMsg = trimmed;
    const currentFile = selectedFile;

    // Reset inputs immediately for responsive UX
    setMessageText("");
    handleRemoveSelectedFile();
    setIsEmojiPickerOpen(false);

    try {
      await sendMessageMutation.mutateAsync({
        recipientId: activeUserId,
        message: currentMsg,
        file: currentFile,
        replyTo: replyingTo?._id,
      });
      setReplyingTo(null);
    } catch {
      // Re-fill on failure
      setMessageText(currentMsg);
      if (currentFile) {
        setSelectedFile(currentFile);
        setImagePreviewUrl(
          currentFile.type.startsWith("image/")
            ? URL.createObjectURL(currentFile)
            : null,
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Escape" && editingMessage) {
      handleCancelEdit();
    } else if (e.key === "Escape" && isEmojiPickerOpen) {
      setIsEmojiPickerOpen(false);
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
  const composerPlaceholder = isRecordingAudio
    ? t.chat.recording
    : recordedAudio
      ? t.chat.voiceMessage
      : editingMessage
        ? isArabic
          ? "عدّل رسالتك..."
          : "Edit your message..."
        : t.chat.typeMessage;

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
                                if (conv.lastMessage?.audioUrl)
                                  return "🎙️ " + t.chat.voiceMessage;
                                if (conv.lastMessage?.imageUrl)
                                  return "📷 " + t.chat.photo;
                                if (conv.lastMessage?.fileUrl)
                                  return "📎 " + (conv.lastMessage.fileName || t.chat.fileAttachment);
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
                      const hasFile = Boolean(msg.fileUrl);
                      const filePresentation = getFilePresentation(msg.fileName);
                      const isAudioFile = filePresentation.category === "audio";
                      const audioSrc = msg.audioUrl || (isAudioFile ? msg.fileUrl : "");
                      const hasAudio = Boolean(audioSrc);
                      const isAutoPhotoText =
                        rawMessage === "📷 Photo" ||
                        rawMessage === "Photo" ||
                        rawMessage === "📷" ||
                        rawMessage.toLowerCase() === "photo";
                      const displayMessage =
                        isAutoPhotoText && hasImage ? "" : rawMessage;
                      const hasText = displayMessage.length > 0;
                      const isImageOnly =
                        hasImage && !hasText && !hasAudio && !hasFile;
                      const isAudioOnly = hasAudio && !hasText && !hasFile;
                      const repliedMessage =
                        msg.replyTo && typeof msg.replyTo !== "string"
                          ? msg.replyTo
                          : null;
                      const repliedSender = repliedMessage?.sender;
                      const repliedSenderId =
                        typeof repliedSender === "string"
                          ? repliedSender
                          : repliedSender?._id;
                      const repliedSenderName =
                        repliedSenderId === currentUser?._id
                          ? t.chat.you
                          : typeof repliedSender === "string"
                            ? activeUser.fullName || activeUser.username
                            : repliedSender?.fullName || repliedSender?.username || activeUser.fullName || activeUser.username;
                      const repliedText = repliedMessage?.isDeleted
                        ? t.chat.replyDeleted
                        : repliedMessage?.message?.trim() ||
                          (repliedMessage?.audioUrl
                            ? `🎙️ ${t.chat.voiceMessage}`
                            : repliedMessage?.imageUrl
                              ? `📷 ${t.chat.photo}`
                              : repliedMessage?.fileUrl
                                ? `📎 ${repliedMessage.fileName || t.chat.fileAttachment}`
                                : "");

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-1.5 group relative hover:z-50 focus-within:z-50 ${
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
                              <Tooltip content={t.chat.reply} position="top">
                                <button
                                  type="button"
                                  onClick={() => handleStartReply(msg)}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-textSecondary hover:text-primary transition-colors cursor-pointer"
                                  aria-label={t.chat.reply}
                                >
                                  <Reply className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                              <Tooltip content={t.chat.forwardMessage} position="top">
                                <button
                                  type="button"
                                  onClick={() => handleForwardMessage(msg)}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-textSecondary hover:text-primary transition-colors cursor-pointer"
                                  aria-label={t.chat.forwardMessage}
                                >
                                  <Forward className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                              {hasText && (
                                <Tooltip content={t.chat.editMessage} position="top">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(msg)}
                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-textSecondary hover:text-primary transition-colors cursor-pointer"
                                    aria-label={t.chat.editMessage}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </Tooltip>
                              )}
                              <Tooltip content={t.chat.deleteMessage} position="top">
                                <button
                                  type="button"
                                  onClick={() => setDeleteModalMessageId(msg._id)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-textSecondary hover:text-rose-500 transition-colors cursor-pointer"
                                  aria-label={t.chat.deleteMessage}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                            </div>
                          )}

                          {/* Message Content Container + Reactions */}
                          <div
                            className={`flex flex-col max-w-[85%] sm:max-w-md ${
                              isMe ? "items-end" : "items-start"
                            }`}
                          >
                            {repliedMessage && (
                              <div
                                className={`w-full mb-1 px-2.5 py-1.5 rounded-xl border-s-2 text-[10px] sm:text-[11px] ${
                                  isMe
                                    ? "border-primary/70 bg-primary/10 text-textPrimary"
                                    : "border-textSecondary/50 bg-bgPrimary/70 text-textSecondary"
                                }`}
                              >
                                <span className="block font-bold truncate">
                                  {repliedSenderName}
                                </span>
                                <span className="block truncate opacity-80">
                                  {repliedText}
                                </span>
                              </div>
                            )}
                            {msg.isForwarded && (
                              <div className="mb-1 flex items-center gap-1 text-[10px] text-textSecondary italic">
                                <Forward className="h-3 w-3" />
                                <span>{t.chat.forwarded}</span>
                              </div>
                            )}
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
                            ) : isAudioOnly ? (
                              <div className="w-fit px-1 py-1">
                                <ChatAudioPlayer
                                  src={audioSrc || ""}
                                  playLabel={t.chat.playAudio}
                                  pauseLabel={t.chat.pauseAudio}
                                />
                                <div
                                  className="flex items-center justify-end gap-1 text-[10px] mt-1 text-textSecondary"
                                >
                                  <span suppressHydrationWarning>{timeFormatted}</span>
                                  {isMe &&
                                    (msg.isRead ? (
                                      <CheckCheck className="h-3 w-3 text-primary" />
                                    ) : (
                                      <Check className="h-3 w-3 text-primary" />
                                    ))}
                                </div>
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

                                {hasAudio && (
                                  <ChatAudioPlayer
                                    src={audioSrc || ""}
                                    playLabel={t.chat.playAudio}
                                    pauseLabel={t.chat.pauseAudio}
                                  />
                                )}

                                {hasFile && !isAudioFile && (
                                  <a
                                    href={msg.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={msg.fileName || undefined}
                                    className={`group mb-1.5 flex min-w-[220px] max-w-[300px] items-center gap-3 rounded-2xl border p-2.5 transition-all hover:-translate-y-0.5 ${
                                      isMe
                                        ? "border-white/15 bg-white/10 hover:bg-white/15"
                                        : "border-borderPrimary/60 bg-bgPrimary/80 hover:bg-bgPrimary"
                                    }`}
                                  >
                                    <span className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${filePresentation.tone}`}>
                                      <FileText className="h-5 w-5" />
                                      <span className="absolute -bottom-1 -right-1 rounded-md border border-bgSecondary bg-bgSecondary px-1 py-0.5 text-[7px] font-black leading-none text-textPrimary shadow-sm">
                                        {filePresentation.label}
                                      </span>
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate text-[11px] font-bold">
                                        {msg.fileName || t.chat.fileAttachment}
                                      </span>
                                      <span className={`mt-0.5 block text-[9px] font-extrabold tracking-wider ${filePresentation.tone.split(" ")[0]}`}>
                                        {filePresentation.label}
                                      </span>
                                    </span>
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bgSecondary/70 text-current transition-colors group-hover:bg-primary group-hover:text-white">
                                      <Download className="h-3.5 w-3.5" />
                                    </span>
                                  </a>
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
                              <Tooltip content={t.chat.reply} position="top">
                                <button
                                  type="button"
                                  onClick={() => handleStartReply(msg)}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-textSecondary hover:text-primary transition-colors cursor-pointer"
                                  aria-label={t.chat.reply}
                                >
                                  <Reply className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                              <Tooltip content={t.chat.forwardMessage} position="top">
                                <button
                                  type="button"
                                  onClick={() => handleForwardMessage(msg)}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-textSecondary hover:text-primary transition-colors cursor-pointer"
                                  aria-label={t.chat.forwardMessage}
                                >
                                  <Forward className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {recordedAudio && audioPreviewUrl && (
                  <div className="px-4 py-2 bg-bgSecondary/90 border-t border-borderPrimary/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mic className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-textPrimary shrink-0">
                        {t.chat.voiceMessage}
                      </span>
                      <ChatAudioPlayer
                        src={audioPreviewUrl}
                        playLabel={t.chat.playAudio}
                        pauseLabel={t.chat.pauseAudio}
                      />
                    </div>
                    <Tooltip content={t.chat.cancelRecording} position="top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearRecordedAudio}
                        className="p-2 rounded-xl text-textSecondary hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        aria-label={t.chat.cancelRecording}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </div>
                )}

                {/* Selected File Preview Bar */}
                {selectedFile && (
                  <div className="px-4 py-2 bg-bgSecondary/90 border-t border-borderPrimary/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {imagePreviewUrl ? (
                        <img
                          src={imagePreviewUrl}
                          alt="Selected attachment"
                          className="h-12 w-12 rounded-xl object-cover border border-borderPrimary"
                        />
                      ) : (
                        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getFilePresentation(selectedFile.name, selectedFile.type).tone}`}>
                          <FileText className="h-5 w-5" />
                          <span className="absolute -bottom-1 -right-1 rounded-md border border-bgSecondary bg-bgSecondary px-1 py-0.5 text-[7px] font-black leading-none text-textPrimary shadow-sm">
                            {getFilePresentation(selectedFile.name, selectedFile.type).label}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <Text
                          as="p"
                          size="xs"
                          font="bold"
                          color="primary"
                          className="truncate"
                        >
                          {selectedFile.name}
                        </Text>
                        <Text
                          as="p"
                          size="xs"
                          color="secondary"
                          className="text-[10px]"
                        >
                          {isArabic ? "جاهز للإرسال" : "Ready to send"} · {getFilePresentation(selectedFile.name, selectedFile.type).label} · {formatFileSize(selectedFile.size, isArabic)}
                        </Text>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveSelectedFile}
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

                {replyingTo && !editingMessage && (
                  <div className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-lg bg-primary/20 text-primary">
                        <Reply className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-primary block text-[11px]">
                          {t.chat.replyingTo}
                        </span>
                        <p className="text-[11px] text-textSecondary truncate max-w-xs sm:max-w-md">
                          {replyingTo.isDeleted
                            ? t.chat.replyDeleted
                            : replyingTo.message ||
                              (replyingTo.audioUrl
                                ? `🎙️ ${t.chat.voiceMessage}`
                            : replyingTo.imageUrl
                                  ? `📷 ${t.chat.photo}`
                                  : replyingTo.fileUrl
                                    ? `📎 ${replyingTo.fileName || t.chat.fileAttachment}`
                                    : "")}
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
                  className="relative z-20 p-3 sm:p-4 border-t border-borderPrimary/40 bg-bgSecondary/60 backdrop-blur-md flex items-center gap-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {isRecordingAudio ? (
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex flex-1 min-w-0 items-center justify-between gap-3 rounded-2xl bg-rose-500/10 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-rose-500">
                          {t.chat.recording}
                        </span>
                        <canvas
                          ref={audioWaveformCanvasRef}
                          width={150}
                          height={32}
                          className="h-8 w-[min(150px,18vw)] text-rose-500"
                          aria-hidden="true"
                        />
                        <span className="shrink-0 font-mono text-xs tabular-nums text-textSecondary">
                          {`${String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:${String(recordingSeconds % 60).padStart(2, "0")}`}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Tooltip content={t.chat.stopRecording} position="top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={stopAudioRecording}
                            className="rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            aria-label={t.chat.stopRecording}
                          >
                            <Square className="h-4 w-4 fill-current" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={t.chat.cancelRecording} position="top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancelAudioRecording}
                            className="rounded-xl text-textSecondary hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                            aria-label={t.chat.cancelRecording}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          disabled={sendAudioMessageMutation.isPending}
                          className="rounded-xl bg-primary text-white hover:bg-primaryHover cursor-pointer disabled:opacity-50"
                          aria-label={t.chat.send}
                          title={t.chat.send}
                        >
                          {sendAudioMessageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 rtl:rotate-180" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                  {!editingMessage && !recordedAudio && (
                    <Tooltip content={t.chat.recordAudio} position="top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={startAudioRecording}
                        disabled={
                          Boolean(messageText.trim()) ||
                          Boolean(selectedFile) ||
                          sendAudioMessageMutation.isPending
                        }
                        className="p-2.5 rounded-xl text-textSecondary hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t.chat.recordAudio}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                  )}

                  {/* Attachment Button (hidden when editing a message) */}
                  {!editingMessage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isRecordingAudio || Boolean(recordedAudio)}
                      className="p-2.5 rounded-xl text-textSecondary hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                      title={t.chat.uploadImage}
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  )}

                  <div className="relative shrink-0">
                    <Tooltip content={t.chat.emojiPicker} position="top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEmojiPickerOpen((open) => !open)}
                        disabled={isRecordingAudio || Boolean(recordedAudio)}
                        className="p-2.5 rounded-xl text-textSecondary hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                        aria-label={t.chat.emojiPicker}
                        aria-expanded={isEmojiPickerOpen}
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                    {isEmojiPickerOpen && (
                      <div className="absolute bottom-full mb-3 ltr:left-0 rtl:right-0 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-borderPrimary shadow-2xl">
                        <EmojiPicker
                          theme={Theme.AUTO}
                          emojiStyle={EmojiStyle.APPLE}
                          onEmojiClick={(emojiData: EmojiClickData) => {
                            setMessageText((text) => text + emojiData.emoji);
                            setIsEmojiPickerOpen(false);
                            setTimeout(() => inputRef.current?.focus(), 0);
                          }}
                          lazyLoadEmojis
                          searchPlaceHolder={
                            isArabic ? "ابحث عن إيموجي..." : "Search emojis..."
                          }
                          width="100%"
                          height={350}
                          previewConfig={{ showPreview: false }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isRecordingAudio || Boolean(recordedAudio)}
                    placeholder={composerPlaceholder}
                    className="flex-1 py-2.5 px-4 text-xs sm:text-sm rounded-2xl bg-bgPrimary border border-borderPrimary/60 text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />

                  {/* Send / Save Button */}
                  <Button
                    type="submit"
                    disabled={
                      sendMessageMutation.isPending ||
                      sendAudioMessageMutation.isPending ||
                      editMessageMutation.isPending ||
                      (!isRecordingAudio &&
                        !recordedAudio &&
                        !messageText.trim() &&
                        !selectedFile)
                    }
                    size="sm"
                    className="rounded-2xl px-4 py-2.5 bg-primary hover:bg-primaryHover text-white cursor-pointer shadow-md disabled:opacity-50 transition-transform active:scale-95"
                  >
                    {sendMessageMutation.isPending ||
                    sendAudioMessageMutation.isPending ||
                    editMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingMessage ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4 rtl:rotate-180" />
                    )}
                  </Button>
                    </>
                  )}
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
        isOpen={isNewChatModalOpen || !!forwardingMessage}
        onClose={() => {
          setIsNewChatModalOpen(false);
          setForwardingMessage(null);
        }}
        onSelectUser={handleSelectChatUser}
        title={forwardingMessage ? t.chat.forwardMessage : undefined}
        description={forwardingMessage ? t.chat.chooseForwardRecipient : undefined}
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
