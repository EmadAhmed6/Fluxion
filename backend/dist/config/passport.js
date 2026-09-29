import GitHubStrategy, {} from "passport-github2";
import passportGoogle, {} from "passport-google-oauth20";
import passport from "passport";
import { User } from "../modules/user/user.model.js";
import bcrypt from "bcryptjs";
const GoogleStrategy = passportGoogle.Strategy;
const configurePassport = () => {
    // GitHub Strategy
    passport.use(new GitHubStrategy.Strategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value ??
                `${profile.username || profile.id}@github.com`;
            const githubPhoto = profile.photos?.[0]?.value ?? "";
            let user = await User.findOne({ email });
            if (user) {
                if ((!user.profilePicture?.url || user.profilePicture.url === "") && githubPhoto) {
                    user.profilePicture = { url: githubPhoto, publicId: null };
                    await user.save({ validateBeforeSave: false });
                }
            }
            else {
                const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
                let username = profile.username || `user_${Date.now()}`;
                if (await User.findOne({ username })) {
                    username = `${username}_${Math.floor(Math.random() * 1000)}`;
                }
                user = await User.create({
                    fullName: profile.displayName || "GitHub User",
                    username,
                    email,
                    password: hashedPassword,
                    provider: "github",
                    isVerified: true,
                    profilePicture: {
                        url: githubPhoto,
                        publicId: null,
                    },
                });
            }
            return done(null, user);
        }
        catch (err) {
            return done(err);
        }
    }));
    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error("No email found from Google account"), false);
            }
            const googlePhoto = profile.photos?.[0]?.value ?? "";
            let user = await User.findOne({ email });
            if (user) {
                if ((!user.profilePicture?.url || user.profilePicture.url === "") && googlePhoto) {
                    user.profilePicture = { url: googlePhoto, publicId: null };
                    await user.save({ validateBeforeSave: false });
                }
            }
            else {
                const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), 10);
                let baseUsername = (email.split("@")[0] || profile.displayName || "user")
                    .toLowerCase()
                    .replace(/[^a-zA-Z0-9_]/g, "") || `user_${Date.now()}`;
                let username = baseUsername;
                if (await User.findOne({ username })) {
                    username = `${username}_${Math.floor(Math.random() * 1000)}`;
                }
                user = await User.create({
                    fullName: profile.displayName || "Google User",
                    username,
                    email,
                    password: hashedPassword,
                    provider: "google",
                    isVerified: true,
                    profilePicture: {
                        url: googlePhoto,
                        publicId: null,
                    },
                });
            }
            return done(null, user);
        }
        catch (err) {
            return done(err);
        }
    }));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        }
        catch (err) {
            done(err, null);
        }
    });
};
export default configurePassport;
//# sourceMappingURL=passport.js.map