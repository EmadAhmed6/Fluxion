import express, { type Request, type Response } from "express";
import {
  register,
  login,
  sendForgotPasswodLink,
  resetPassword,
  verifyEmailOTP,
  resendOTP,
  getMe,
  handleRefreshToken,
  logout,
} from "./auth.controller.js";
import {
  verifyRefreshToken,
  verifyToken,
} from "../../middlewares/verifyToken.js";
import { authLimiter } from "../../middlewares/limiter.js";
import passport from "passport";
const router = express.Router();

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, sendForgotPasswodLink);
router.post("/reset-password/:userId/:token", resetPassword);
router.post("/verify-otp", verifyEmailOTP);
router.post("/resend-otp", authLimiter, resendOTP);
router.get("/me", verifyToken, getMe);
router.post("/refresh-token", verifyRefreshToken, handleRefreshToken);

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
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/login?error=user_not_found`,
        );
        return;
      }
      const token = user.generateToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=github`,
      );
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=auth_failed`);
    }
  },
);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth/login?error=google_failed`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(
          `${process.env.FRONTEND_URL}/auth/login?error=user_not_found`,
        );
        return;
      }
      const token = user.generateToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google`,
      );
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
