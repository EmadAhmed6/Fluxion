import { Language } from "@/lib/translations";

export interface AuthTranslations {
  welcomeBack: string;
  welcomeBackDesc: string;
  startCreating: string;
  startCreatingDesc: string;
  forgotPasswordTitle: string;
  forgotPasswordDesc: string;
  resetPasswordTitle: string;
  resetPasswordDesc: string;
  verifyOtpTitle: string;
  verifyOtpDesc: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  jobTitleLabel: string;
  jobTitlePlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  forgotPasswordLink: string;
  signInBtn: string;
  signingInBtn: string;
  createAccountBtn: string;
  creatingAccountBtn: string;
  sendEmailBtn: string;
  sendingLinkBtn: string;
  resetPasswordBtn: string;
  resettingBtn: string;
  verifyAccountBtn: string;
  verifyingOtpBtn: string;
  dontHaveAccount: string;
  createOneNow: string;
  alreadyHaveAccount: string;
  backToLogin: string;
  checkYourEmail: string;
  checkEmailDesc: string;
  canResendIn: string;
  resendEmail: string;
  enter6DigitCode: string;
  alreadyVerified: string;
  continueWithGithub: string;
  continueWithGoogle: string;
  orDivider: string;
  loginIdentifierLabel: string;
  loginIdentifierPlaceholder: string;
}

export const authTranslations: Record<Language, AuthTranslations> = {
  en: {
    welcomeBack: "Welcome Back",
    welcomeBackDesc: "Enter your credentials to access your account",
    startCreating: "Start Creating",
    startCreatingDesc: "Join our network of writers and developers today",
    forgotPasswordTitle: "Forgot Password",
    forgotPasswordDesc: "Enter your email to receive recovery instructions",
    resetPasswordTitle: "Reset Password",
    resetPasswordDesc: "Enter your new password below",
    verifyOtpTitle: "Verify OTP Code",
    verifyOtpDesc: "Enter the 6-digit verification code sent to your email",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    loginIdentifierLabel: "Email address or Username",
    loginIdentifierPlaceholder: "you@example.com or username",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    usernameLabel: "Username",
    usernamePlaceholder: "emad_121",
    jobTitleLabel: "Job Title (Optional)",
    jobTitlePlaceholder: "Frontend Developer",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "••••••••",
    forgotPasswordLink: "Forgot password?",
    signInBtn: "Sign In",
    signingInBtn: "Signing In...",
    createAccountBtn: "Create Account",
    creatingAccountBtn: "Creating Account...",
    sendEmailBtn: "Send Email",
    sendingLinkBtn: "Sending link...",
    resetPasswordBtn: "Reset Password",
    resettingBtn: "Resetting...",
    verifyAccountBtn: "Verify Account",
    verifyingOtpBtn: "Verifying OTP...",
    dontHaveAccount: "Don't have an account?",
    createOneNow: "Create one now",
    alreadyHaveAccount: "Already have an account?",
    backToLogin: "Back to login",
    checkYourEmail: "Check your email",
    checkEmailDesc:
      "We've sent recovery link to your inbox. Check spam if not found.",
    canResendIn: "You can resend in",
    resendEmail: "Resend Email",
    enter6DigitCode: "Enter 6-Digit Code",
    alreadyVerified: "Already verified?",
    continueWithGithub: "Continue with GitHub",
    continueWithGoogle: "Continue with Google",
    orDivider: "OR",
  },
  ar: {
    welcomeBack: "أهلاً بيك تاني",
    welcomeBackDesc: "ادخل بياناتك عشان تفتح حسابك",
    startCreating: "ابدأ انشر أفكارك",
    startCreatingDesc: "انضم لمجتمع المطورين والكتّاب بتاعنا النهاردة",
    forgotPasswordTitle: "نسيت الباسورد؟",
    forgotPasswordDesc: "اكتب إيميلك وهنبعتلك رابط استرجاع الحساب",
    resetPasswordTitle: "تغيير الباسورد",
    resetPasswordDesc: "اكتب الباسورد الجديد بتاعك",
    verifyOtpTitle: "تأكيد كود الـ OTP",
    verifyOtpDesc: "اكتب كود الـ 6 أرقام اللي اتبعت على إيميلك",
    emailLabel: "عنوان الإيميل",
    emailPlaceholder: "you@example.com",
    loginIdentifierLabel: "عنوان الإيميل أو اسم المستخدم",
    loginIdentifierPlaceholder: "you@example.com أو اسم المستخدم",
    passwordLabel: "الباسورد",
    passwordPlaceholder: "••••••••",
    usernameLabel: "اسم المستخدم",
    usernamePlaceholder: "مثلاً: emad_121",
    jobTitleLabel: "المسمى الوظيفي (اختياري)",
    jobTitlePlaceholder: "مثلاً: فرونت إند ديفيلوبر",
    confirmPasswordLabel: "تأكيد الباسورد",
    confirmPasswordPlaceholder: "••••••••",
    forgotPasswordLink: "نسيت الباسورد؟",
    signInBtn: "سجل دخول",
    signingInBtn: "جاري تسجيل الدخول...",
    createAccountBtn: "اعمل حساب جديد",
    creatingAccountBtn: "جاري إنشاء الحساب...",
    sendEmailBtn: "ابعت الإيميل",
    sendingLinkBtn: "جاري الإرسال...",
    resetPasswordBtn: "غير الباسورد",
    resettingBtn: "جاري التغيير...",
    verifyAccountBtn: "أكد الحساب",
    verifyingOtpBtn: "جاري التأكيد...",
    dontHaveAccount: "مش عندك حساب؟",
    createOneNow: "سجل حساب دلوقتي",
    alreadyHaveAccount: "عندك حساب بالفعل؟",
    backToLogin: "ارجع لتسجيل الدخول",
    checkYourEmail: "افحص إيميلك",
    checkEmailDesc: "بعتنالك رابط الاسترجاع على إيميلك.",
    canResendIn: "تقدر تبعت تاني خلال",
    resendEmail: "عادة إرسال الإيميل",
    enter6DigitCode: "ادخل كود الـ 6 أرقام",
    alreadyVerified: "مـتأكد بالفعل؟",
    continueWithGithub: "متابعة بواسطة GitHub",
    continueWithGoogle: "متابعة بواسطة Google",
    orDivider: "أو",
  },
};
