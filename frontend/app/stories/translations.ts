export interface StoryTranslations {
  stories: string;
  addStory: string;
  yourStory: string;
  createStory: string;
  storyCaption: string;
  chooseMedia: string;
  shareStory: string;
  sharing: string;
  close: string;
  deleteStory: string;
  reactToStory: string;
  replyToStory: string;
  replyPlaceholder: string;
  sendReply: string;
  storyReplySent: string;
  noStories: string;
  imageOrVideoOnly: string;
}

export const storyTranslations: Record<"en" | "ar", StoryTranslations> = {
  en: {
    stories: "Stories",
    addStory: "Add story",
    yourStory: "Your story",
    createStory: "Create a story",
    storyCaption: "Add a caption (optional)",
    chooseMedia: "Choose a photo or video",
    shareStory: "Share story",
    sharing: "Sharing…",
    close: "Close story",
    deleteStory: "Delete story",
    reactToStory: "React to story",
    replyToStory: "Reply to story",
    replyPlaceholder: "Send a reply...",
    sendReply: "Send reply",
    storyReplySent: "Reply sent",
    noStories: "No stories yet",
    imageOrVideoOnly: "Choose an image or video up to 100 MB.",
  },
  ar: {
    stories: "القصص",
    addStory: "أضف قصة",
    yourStory: "قصتك",
    createStory: "إنشاء قصة",
    storyCaption: "أضف وصفًا (اختياري)",
    chooseMedia: "اختر صورة أو فيديو",
    shareStory: "نشر القصة",
    sharing: "جاري النشر…",
    close: "إغلاق القصة",
    deleteStory: "حذف القصة",
    reactToStory: "تفاعل مع القصة",
    replyToStory: "الرد على القصة",
    replyPlaceholder: "اكتب ردك...",
    sendReply: "إرسال الرد",
    storyReplySent: "تم إرسال الرد",
    noStories: "لا توجد قصص بعد",
    imageOrVideoOnly: "اختر صورة أو فيديو بحجم أقل من ١٠٠ ميجابايت.",
  },
};
