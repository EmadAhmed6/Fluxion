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
  unread: string;
  editMessage: string;
  editingMessage: string;
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
    uploadImage: "Attach image",
    unread: "unread",
    editMessage: "Edit message",
    editingMessage: "Editing message",
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
    uploadImage: "إرفاق صورة",
    unread: "غير مقروءة",
    editMessage: "تعديل الرسالة",
    editingMessage: "تعديل الرسالة",
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
  },
};
