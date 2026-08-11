import express, { type Request, type Response } from "express";
import {
  register,
  login,
  sendForgotPasswodLink,
  resetPassword,
  verifyEmailOTP,
  resendOTP,
  getMe,
} from "./auth.controller.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { authLimiter } from "../../middlewares/limiter.js";
import passport from "passport";
import { User } from "../user/user.model.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, sendForgotPasswodLink);
router.post("/reset-password/:userId/:token", resetPassword);
router.post("/verify-otp", verifyEmailOTP);
router.post("/resend-otp", authLimiter, resendOTP);
router.get("/me", verifyToken, getMe);

// Github OAuth

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=github_failed`,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/login?error=user_not_found`,
        );
        return;
      }
      const token = user.generateToken();
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=auth_failed`);
    }
  },
);

router.get("/current-user", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ success: true, data: { user: req.user } });
    return;
  } else {
    res.status(401).json({
      success: false,
      data: { message: "Unauthorized" },
    });
    return;
  }
});

export default router;
