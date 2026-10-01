import { Language } from "@/lib/translations";

export interface ProfileTranslations {
  userProfile: string;
  myProfile: string;
  editProfile: string;
  articlesPublished: string;
  totalLikes: string;
  joined: string;
  noPostsYet: string;
  userPosts: string;
  changePhoto: string;
  jobTitle: string;
  bio: string;
  saveProfile: string;
  owner: string;
  admin: string;
  editUser: string;
  setAdmin: string;
  removeAdmin: string;
  viewProfile: string;
  changePassword: string;
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  savePassword: string;
  deletePhoto: string;
  confirmDeletePhoto: string;
  followers: string;
  following: string;
  follow: string;
  unfollow: string;
  followingStatus: string;
  followersModalTitle: string;
  followingModalTitle: string;
  noFollowers: string;
  noFollowing: string;
  searchUsers: string;
  noUsersFound: string;
  blockUser: string;
  unblockUser: string;
  confirmBlockTitle: string;
  confirmBlockMessage: string;
  blockedProfileTitle: string;
  blockedProfileMessage: string;
  blockedUsers: string;
  blockedUsersModalTitle: string;
  noBlockedUsers: string;
  blockedUsersLoadError: string;
}


export const profileTranslations: Record<Language, ProfileTranslations> = {
  en: {
    userProfile: "User Profile",
    myProfile: "My Profile",
    editProfile: "Edit Profile",
    articlesPublished: "Posts Published",
    totalLikes: "Total Likes Received",
    joined: "Joined",
    noPostsYet: "No posts published yet.",
    userPosts: "User Posts",
    changePhoto: "Change Photo",
    deletePhoto: "Delete Photo",
    confirmDeletePhoto: "Are you sure you want to delete this profile picture?",
    jobTitle: "Job Title",
    bio: "Bio",
    saveProfile: "Save Profile",
    owner: "Owner",
    admin: "Admin",
    editUser: "Edit User",
    setAdmin: "Set as Admin",
    removeAdmin: "Remove Admin",
    viewProfile: "View Profile",
    changePassword: "Change Password",
    oldPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    savePassword: "Update Password",
    followers: "Followers",
    following: "Following",
    follow: "Follow",
    unfollow: "Unfollow",
    followingStatus: "Following",
    followersModalTitle: "Followers",
    followingModalTitle: "Following",
    noFollowers: "No followers yet.",
    noFollowing: "Not following anyone yet.",
    searchUsers: "Search users...",
    noUsersFound: "No users found matching your search.",
    blockUser: "Block User",
    unblockUser: "Unblock User",
    confirmBlockTitle: "Block User",
    confirmBlockMessage: "Are you sure you want to block this user? They will not be able to view your profile, posts, or send you messages.",
    blockedProfileTitle: "Profile Unavailable",
    blockedProfileMessage: "You cannot view this profile or posts due to block settings.",
    blockedUsers: "Blocked Users",
    blockedUsersModalTitle: "People you have blocked",
    noBlockedUsers: "You haven't blocked anyone yet.",
    blockedUsersLoadError: "Couldn't load your blocked users. Please try again.",
  },
  ar: {
    userProfile: "الملف الشخصي",
    myProfile: "بروفايلي",
    editProfile: "تعديل البروفايل",
    articlesPublished: "البوستات المنشورة",
    totalLikes: "إجمالي اللايكات اللي جته",
    joined: "انضم في",
    noPostsYet: "لسه مانشرش أي بوستات.",
    userPosts: "بوستات المستخدم",
    changePhoto: "تغيير الصورة",
    deletePhoto: "حذف الصورة",
    confirmDeletePhoto: "هل أنت متأكد من حذف الصورة الشخصية؟",
    jobTitle: "المسمى الوظيفي",
    bio: "نبذة عنه",
    saveProfile: "حفظ البروفايل",
    owner: "صاحب الموقع",
    admin: "أدمن",
    editUser: "تعديل بيانات اليوزر",
    setAdmin: "خليه أدمن",
    removeAdmin: "شيل صلاحية الأدمن",
    viewProfile: "شوف البروفايل",
    changePassword: "تغيير كلمة المرور",
    oldPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    savePassword: "حفظ كلمة المرور",
    followers: "المتابعون",
    following: "يتابع",
    follow: "متابعة",
    unfollow: "إلغاء المتابعة",
    followingStatus: "تتابعه",
    followersModalTitle: "المتابعون",
    followingModalTitle: "قائمة المتابَعين",
    noFollowers: "لا يوجد متابعون حتى الآن.",
    noFollowing: "لا يتابع أي شخص حتى الآن.",
    searchUsers: "البحث في القائمة...",
    noUsersFound: "لم يتم العثور على أي مستخدم مطابق.",
    blockUser: "حظر المستخدم",
    unblockUser: "إلغاء الحظر",
    confirmBlockTitle: "حظر المستخدم",
    confirmBlockMessage: "هل أنت متأكد من حظر هذا المستخدم؟ لن يتمكن من رؤية بروفايلك أو بوستاتك أو إرسال رسائل لك.",
    blockedProfileTitle: "الملف الشخصي غير متاح",
    blockedProfileMessage: "لا يمكنك رؤية هذا البروفايل أو المنشورات بسبب إعدادات الحظر.",
    blockedUsers: "المحظورون",
    blockedUsersModalTitle: "الأشخاص الذين حظرتهم",
    noBlockedUsers: "لم تحظر أي شخص حتى الآن.",
    blockedUsersLoadError: "تعذر تحميل قائمة المحظورين. حاول مرة أخرى.",
  },
};
