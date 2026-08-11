import { Language } from "@/lib/translations";

export interface AdminTranslations {
  dashboard: string;
  navMenu: string;
  usersManagement: string;
  postsManagement: string;
  adminBadge: string;
  searchUsers: string;
  searchPosts: string;
  actions: string;
  role: string;
  admin: string;
  user: string;
  makeAdmin: string;
  removeAdmin: string;
  deleteUser: string;
  deletePost: string;
  provider: string;
  allProviders: string;
  localProvider: string;
  googleProvider: string;
  githubProvider: string;
  previousPage: string;
  nextPage: string;
  pageOf: string;
  totalUsersCount: string;
  searchJobTitle: string;
}

export const adminTranslations: Record<Language, AdminTranslations> = {
  en: {
    dashboard: "Admin Control Dashboard",
    navMenu: "Navigation Menu",
    usersManagement: "Users Management",
    postsManagement: "Posts Management",
    adminBadge: "Administrator",
    searchUsers: "Search name, email, job title...",
    searchPosts: "Search posts...",
    actions: "Actions",
    role: "Role",
    admin: "Admin",
    user: "User",
    makeAdmin: "Make Admin",
    removeAdmin: "Remove Admin",
    deleteUser: "Delete User",
    deletePost: "Delete Post",
    provider: "Auth Method",
    allProviders: "All Methods",
    localProvider: "Email & Password",
    googleProvider: "Google OAuth",
    githubProvider: "GitHub OAuth",
    previousPage: "Previous",
    nextPage: "Next",
    pageOf: "Page",
    totalUsersCount: "Total Users",
    searchJobTitle: "Filter by Job Title...",
  },
  ar: {
    dashboard: "الداشبورد للأدمن",
    navMenu: "القائمة الرئيسية",
    usersManagement: "إدارة المستخدمين",
    postsManagement: "إدارة البوستات",
    adminBadge: "أدمن النظام",
    searchUsers: "دور بالاسم، الإيميل، المسمى الوظيفي...",
    searchPosts: "دور على بوست...",
    actions: "الإجراءات",
    role: "الصلاحية",
    admin: "أدمن",
    user: "مستخدم",
    makeAdmin: "خيله أدمن",
    removeAdmin: "شيل صلاحية الأدمن",
    deleteUser: "مسح اليوزر",
    deletePost: "مسح البوست",
    provider: "طريقة التسجيل",
    allProviders: "كل الطرق",
    localProvider: "إيميل وباسورد",
    googleProvider: "جوجل",
    githubProvider: "جيت هاب",
    previousPage: "السابق",
    nextPage: "التالي",
    pageOf: "صفحة",
    totalUsersCount: "إجمالي اليوزرات",
    searchJobTitle: "فلتر بالـ Job Title...",
  },
};
