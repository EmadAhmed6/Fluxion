declare const sendEmail: (to: string, subject: string, html: string) => Promise<void>;
declare const generateOtpEmailHtml: (username: string, otp: string) => string;
declare const generateResetPasswordEmailHtml: (username: string, resetLink: string) => string;
export { sendEmail, generateOtpEmailHtml, generateResetPasswordEmailHtml };
//# sourceMappingURL=Email.d.ts.map