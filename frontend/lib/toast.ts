import { toast as sonnerToast, type ExternalToast } from "sonner";

const toastTranslationsAr: Record<string, string> = {
  // Post operations
  "Post published successfully!": "تم نشر البوست بنجاح!",
  "Failed to publish post.": "فشل نشر البوست.",
  "Post updated successfully!": "تم تعديل البوست بنجاح!",
  "Post updated!": "تم تعديل البوست بنجاح!",
  "Failed to update post.": "فشل تعديل البوست.",
  "Post deleted successfully!": "تم مسح البوست بنجاح!",
  "Post deleted successfully.": "تم مسح البوست بنجاح!",
  "Failed to delete post.": "فشل مسح البوست.",
  "Post shared successfully!": "تم شير البوست بنجاح!",
  "Post shared to your feed!": "تم شير البوست لصفحتك بنجاح!",
  "Could not share post.": "فشل شير البوست.",
  "Failed to share post.": "فشل شير البوست.",
  "Error creating post. Please try again.": "حصل مشكلة أثناء نشر البوست. حاول تاني.",

  // Comments & Replies
  "Comment added.": "تم إضافة الكومنت بنجاح!",
  "Comment added successfully!": "تم إضافة الكومنت بنجاح!",
  "Failed to add comment.": "فشل إضافة الكومنت.",
  "Comment updated!": "تم تعديل الكومنت بنجاح!",
  "Comment updated successfully!": "تم تعديل الكومنت بنجاح!",
  "Failed to update comment.": "فشل تعديل الكومنت.",
  "Comment deleted!": "تم مسح الكومنت بنجاح!",
  "Comment deleted successfully!": "تم مسح الكومنت بنجاح!",
  "Failed to delete comment.": "فشل مسح الكومنت.",
  "Reply added!": "تم إضافة الرد بنجاح!",
  "Reply added successfully!": "تم إضافة الرد بنجاح!",
  "Failed to add reply.": "فشل إضافة الرد.",
  "Reply updated!": "تم تعديل الرد بنجاح!",
  "Failed to update reply.": "فشل تعديل الرد.",
  "Reply deleted!": "تم مسح الرد بنجاح!",
  "Reply deleted successfully!": "تم مسح الرد بنجاح!",
  "Failed to delete reply.": "فشل مسح الرد.",

  // User Profile & Management
  "Profile picture updated!": "تم تحديث صورة البروفايل بنجاح!",
  "Profile picture updated successfully!": "تم تحديث صورة البروفايل بنجاح!",
  "Failed to upload profile picture.": "فشل رفع صورة البروفايل.",
  "Profile updated successfully!": "تم تحديث البروفايل بنجاح!",
  "Failed to update profile.": "فشل تحديث البروفايل.",
  "Password changed successfully!": "تم تغيير كلمة المرور بنجاح!",
  "Failed to change password.": "فشل تغيير كلمة المرور.",
  "You cannot change other user's password": "مش مسموح لك تغير باسورد مستخدم تاني.",
  "User deleted successfully!": "تم مسح اليوزر بنجاح!",

  "Failed to delete user.": "فشل مسح اليوزر.",
  "Signed out successfully!": "تم تسجيل الخروج بنجاح!",
  "Logged out successfully!": "تم تسجيل الخروج بنجاح!",

  // Follow operations
  "Followed successfully": "تمت المتابعة بنجاح!",
  "Unfollowed successfully": "تم إلغاء المتابعة بنجاح!",
  "You cannot follow yourself": "لا يمكنك متابعة نفسك",
  "Failed to update follow status": "فشل تحديث حالة المتابعة",

  // Auth operations
  "Signed in successfully! Welcome back.": "تم تسجيل الدخول بنجاح! أهلاً بيك تاني.",
  "Login successful but token missing from server response.": "تم الدخول بنجاح لكن مفيش توكن.",
  "Invalid email or password. Please try again.": "الإيميل أو الباسورد غلط. حاول تاني.",
  "Account created successfully! Please verify your OTP code.": "تم إنشاء الحساب بنجاح! أكد الكود اللى اتبعتلك.",
  "Error registering account. Email or username might already exist.": "فشل إنشاء الحساب. الإيميل أو اسم المستخدم مستخدم قبل كدا.",
  "Recovery link sent!": "تم إرسال رابط الاسترجاع!",
  "Failed to send reset link. Please try again.": "فشل إرسال رابط الاسترجاع. حاول تاني.",
  "Account verified successfully! Please sign in.": "تم تأكيد الحساب بنجاح! سجل دخول دلوقتي.",
  "Invalid OTP code or expired code. Please try again.": "كود الـ OTP غلط أو انتهى. حاول تاني.",
  "Password reset successfully! Please log in with your new password.": "تم تغيير الباسورد بنجاح! سجل دخول بالباسورد الجديد.",
  "Failed to reset password. Please try again.": "فشل تغيير الباسورد. حاول تاني.",
  "Verification link resent! Check your inbox.": "تم إعادة إرسال رابط التأكيد!",

  // System & Files
  "Image file size should be less than 5MB.": "حجم الصورة لازم يكون أقل من 5 ميجا.",

  // Server error messages
  "User not found": "اليوزر مش موجود",
  "Invalid credentials": "بيانات الدخول مش صحيحة",
  "User already exists": "اليوزر ده موجود قبل كدا",
  "Unauthorized access": "غير مسموح لك بالوصول",
  "Post not found": "البوست مش موجود",
  "Comment not found": "الكومنت مش موجود",
  "Invalid OTP code": "كود الـ OTP مش صح",
  "Expired OTP code": "كود الـ OTP انتهت صلاحيته",
};

function getTranslatedToastMessage(message: string | React.ReactNode): string | React.ReactNode {
  if (typeof message !== "string") return message;
  const isAr =
    (typeof document !== "undefined" && document.documentElement.lang === "ar") ||
    (typeof localStorage !== "undefined" && localStorage.getItem("lang") === "ar");

  if (isAr && toastTranslationsAr[message]) {
    return toastTranslationsAr[message];
  }
  return message;
}

export const toast = {
  success: (message: string | React.ReactNode, options?: ExternalToast) => {
    return sonnerToast.success(getTranslatedToastMessage(message), options);
  },
  error: (message: string | React.ReactNode, options?: ExternalToast) => {
    return sonnerToast.error(getTranslatedToastMessage(message), options);
  },
  info: (message: string | React.ReactNode, options?: ExternalToast) => {
    return sonnerToast.info(getTranslatedToastMessage(message), options);
  },
  warning: (message: string | React.ReactNode, options?: ExternalToast) => {
    return sonnerToast.warning(getTranslatedToastMessage(message), options);
  },
  dismiss: sonnerToast.dismiss,
};

export const appToast = toast;
