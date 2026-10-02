export interface ChatTranslations {
  chats: string;
  searchConversations: string;
  newChat: string;
  startChatPrompt: string;
  startChatSubtext: string;
  typeMessage: string;
  send: string;
  deleteMessage: string;
  deleteConfirm: string;
  noConversations: string;
  noConversationsDesc: string;
  you: string;
  photo: string;
  startConversationWith: string;
  noUsersFound: string;
  directMessage: string;
  back: string;
  uploadImage: string;
  fileAttachment: string;
  unread: string;
  editMessage: string;
  editingMessage: string;
  reply: string;
  replyingTo: string;
  replyDeleted: string;
  cancel: string;
  save: string;
  edited: string;
  messageDeleted: string;
  react: string;
  reactions: string;
  reactionLove: string;
  reactionLike: string;
  reactionCare: string;
  reactionHaha: string;
  reactionWow: string;
  reactionSad: string;
  reactionAngry: string;
  reactionEggs: string;
  forwardMessage: string;
  pinMessage: string;
  unpinMessage: string;
  pinned: string;
  youPinnedMessage: string;
  starMessage: string;
  unstarMessage: string;
  starred: string;
  allMessages: string;
  pinnedMessages: string;
  starredMessages: string;
  noPinnedMessages: string;
  noStarredMessages: string;
  previousPinnedMessage: string;
  nextPinnedMessage: string;
  chooseForwardRecipient: string;
  forwarded: string;
  emojiPicker: string;
  voiceMessage: string;
  recordAudio: string;
  stopRecording: string;
  cancelRecording: string;
  recording: string;
  playAudio: string;
  pauseAudio: string;
}

export const chatTranslations: Record<"en" | "ar", ChatTranslations> = {
  en: {
    chats: "Messages",
    searchConversations: "Search conversations or people...",
    newChat: "New Message",
    startChatPrompt: "Select a conversation to start chatting",
    startChatSubtext: "Connect, collaborate and chat with fellow developers in real time.",
    typeMessage: "Type your message...",
    send: "Send",
    deleteMessage: "Delete Message",
    deleteConfirm: "Are you sure you want to delete this message?",
    noConversations: "No messages yet",
    noConversationsDesc: "Search for a user or start a new conversation to connect!",
    you: "You",
    photo: "Photo",
    startConversationWith: "Start conversation with",
    noUsersFound: "No users found",
    directMessage: "Message",
    back: "Back",
    uploadImage: "Attach file",
    fileAttachment: "File attachment",
    unread: "unread",
    editMessage: "Edit message",
    editingMessage: "Editing message",
    reply: "Reply",
    replyingTo: "Replying to",
    replyDeleted: "Original message was deleted",
    cancel: "Cancel",
    save: "Save",
    edited: "edited",
    messageDeleted: "This message was deleted",
    react: "React",
    reactions: "Reactions",
    reactionLove: "Love",
    reactionLike: "Like",
    reactionCare: "Care",
    reactionHaha: "Haha",
    reactionWow: "Wow",
    reactionSad: "Sad",
    reactionAngry: "Angry",
    reactionEggs: "Eggs",
    forwardMessage: "Forward message",
    pinMessage: "Pin message",
    unpinMessage: "Unpin message",
    pinned: "Pinned",
    youPinnedMessage: "You pinned a message",
    starMessage: "Star message",
    unstarMessage: "Remove star",
    starred: "Starred",
    allMessages: "All messages",
    pinnedMessages: "Pinned",
    starredMessages: "Starred",
    noPinnedMessages: "No pinned messages",
    noStarredMessages: "No starred messages",
    previousPinnedMessage: "Previous pinned message",
    nextPinnedMessage: "Next pinned message",
    chooseForwardRecipient: "Choose someone to forward this message to",
    forwarded: "Forwarded",
    emojiPicker: "Add emoji",
    voiceMessage: "Voice message",
    recordAudio: "Record voice message",
    stopRecording: "Stop recording",
    cancelRecording: "Cancel recording",
    recording: "Recording",
    playAudio: "Play audio message",
    pauseAudio: "Pause audio message",
  },
  ar: {
    chats: "الرسائل",
    searchConversations: "ابحث في المحادثات أو الأشخاص...",
    newChat: "رسالة جديدة",
    startChatPrompt: "اختر محادثة لبدء الدردشة",
    startChatSubtext: "تواصل ودردش وشارك الأفكار مع المطورين لحظياً وبكل سهولة.",
    typeMessage: "اكتب رسالتك هنا...",
    send: "إرسال",
    deleteMessage: "حذف الرسالة",
    deleteConfirm: "هل أنت متأكد من حذف هذه الرسالة؟",
    noConversations: "لا توجد رسائل بعد",
    noConversationsDesc: "ابحث عن مطور أو ابدأ محادثة جديدة للتواصل!",
    you: "أنت",
    photo: "صورة",
    startConversationWith: "بدء محادثة مع",
    noUsersFound: "لم يتم العثور على مستخدمين",
    directMessage: "مراسلة",
    back: "رجوع",
    uploadImage: "إرفاق ملف",
    fileAttachment: "ملف مرفق",
    unread: "غير مقروءة",
    editMessage: "تعديل الرسالة",
    editingMessage: "تعديل الرسالة",
    reply: "رد",
    replyingTo: "الرد على",
    replyDeleted: "تم حذف الرسالة الأصلية",
    cancel: "إلغاء",
    save: "حفظ",
    edited: "معدلة",
    messageDeleted: "تم حذف هذه الرسالة",
    react: "تفاعل",
    reactions: "التفاعلات",
    reactionLove: "أحببته",
    reactionLike: "أعجبني",
    reactionCare: "أدعمه",
    reactionHaha: "هاها",
    reactionWow: "واو",
    reactionSad: "أحزنني",
    reactionAngry: "أغضبني",
    reactionEggs: "ابضنني",
    forwardMessage: "إعادة توجيه الرسالة",
    pinMessage: "تثبيت الرسالة",
    unpinMessage: "إلغاء تثبيت الرسالة",
    pinned: "مثبّتة",
    youPinnedMessage: "لقد ثبّت رسالة",
    starMessage: "تمييز بنجمة",
    unstarMessage: "إزالة النجمة",
    starred: "مميزة بنجمة",
    allMessages: "كل الرسائل",
    pinnedMessages: "المثبتة",
    starredMessages: "المميزة بنجمة",
    noPinnedMessages: "لا توجد رسائل مثبتة",
    noStarredMessages: "لا توجد رسائل مميزة بنجمة",
    previousPinnedMessage: "الرسالة المثبتة السابقة",
    nextPinnedMessage: "الرسالة المثبتة التالية",
    chooseForwardRecipient: "اختر شخصًا لإعادة توجيه الرسالة إليه",
    forwarded: "تمت إعادة التوجيه",
    emojiPicker: "إضافة إيموجي",
    voiceMessage: "رسالة صوتية",
    recordAudio: "تسجيل رسالة صوتية",
    stopRecording: "إيقاف التسجيل",
    cancelRecording: "إلغاء التسجيل",
    recording: "جارٍ التسجيل",
    playAudio: "تشغيل الرسالة الصوتية",
    pauseAudio: "إيقاف الرسالة الصوتية مؤقتًا",
  },
};
