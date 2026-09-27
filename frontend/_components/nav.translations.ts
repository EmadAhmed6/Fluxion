import { Language } from "@/lib/translations";

export interface NavTranslations {
  searchPlaceholder: string;
  noUsersFound: string;
  signIn: string;
  signUp: string;
  myProfile: string;
  adminDashboard: string;
  dashboard: string;
  logOut: string;
  themeLight: string;
  themeDark: string;
  account: string;
  user: string;
  language: string;
  english: string;
  arabic: string;
  notifications: string;
  markAllAsRead: string;
  noNotifications: string;
  noUnreadNotifications: string;
  allNotifications: string;
  unreadNotifications: string;
  notifFollow: string;
  notifLike: string;
  notifComment: string;
  notifReply: string;
  notifShare: string;
  notifLikeComment: string;
  notifLikeReply: string;
  viewPost: string;
  viewProfile: string;
}

export const navTranslations: Record<Language, NavTranslations> = {
  en: {
    searchPlaceholder: "Search user by name or username...",
    noUsersFound: "No users found",
    signIn: "Sign In",
    signUp: "Sign Up",
    myProfile: "My Profile",
    adminDashboard: "Admin Dashboard",
    dashboard: "Dashboard",
    logOut: "Log Out",
    themeLight: "Switch to Light Mode",
    themeDark: "Switch to Dark Mode",
    account: "Account",
    user: "User",
    language: "Language",
    english: "English",
    arabic: "عربي (مصري)",
    notifications: "Notifications",
    markAllAsRead: "Mark all as read",
    noNotifications: "No notifications yet",
    noUnreadNotifications: "No unread notifications",
    allNotifications: "All",
    unreadNotifications: "Unread",
    notifFollow: "started following you",
    notifLike: "liked your post",
    notifComment: "commented on your post",
    notifReply: "replied to your comment",
    notifShare: "shared your post",
    notifLikeComment: "liked your comment",
    notifLikeReply: "liked your reply",
    viewPost: "View Post",
    viewProfile: "View Profile",
  },
  ar: {
    searchPlaceholder: "ابحث عن مستخدم بالاسم أو اليوزر نيم...",
    noUsersFound: "مفيش مستخدم بالاسم ده",
    signIn: "سجل دخول",
    signUp: "اعمل حساب",
    myProfile: "بروفايلي",
    adminDashboard: "الداشبورد",
    dashboard: "الداشبورد",
    logOut: "تسجيل خروج",
    themeLight: "المود الفاتح",
    themeDark: "المود الضلمة",
    account: "الحساب",
    user: "يوزر",
    language: "اللغة",
    english: "English",
    arabic: "عربي (مصري)",
    notifications: "الإشعارات",
    markAllAsRead: "تحديد الكل كمقروء",
    noNotifications: "مفيش أي إشعارات دلوقتي",
    noUnreadNotifications: "مفيش إشعارات جديدة غير مقروءة",
    allNotifications: "الكل",
    unreadNotifications: "غير المقروءة",
    notifFollow: "بدأ يتابعك",
    notifLike: "عمل لايك على منشورك",
    notifComment: "علق على منشورك",
    notifReply: "رد على تعليقك",
    notifShare: "شير منشورك",
    notifLikeComment: "عمل لايك على تعليقك",
    notifLikeReply: "عمل لايك على ردك",
    viewPost: "عرض البوست",
    viewProfile: "عرض البروفايل",
  },
};


