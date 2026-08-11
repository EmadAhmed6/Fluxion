import GitHubStrategy, { type Profile } from "passport-github2";
import passport from "passport";
import { User } from "../modules/user/user.model.js";
import bcrypt from "bcryptjs";

const configurePassport = () => {
  passport.use(
    new GitHubStrategy.Strategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any, info?: any) => void,
      ) => {
        try {
          const email =
            profile.emails?.[0]?.value ??
            `${profile.username || profile.id}@github.com`;
          let user = await User.findOne({ email });
          if (!user) {
            const hashedPassword = await bcrypt.hash(
              Math.random().toString(36).slice(-10),
              10,
            );
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
                url: profile.photos?.[0]?.value ?? "",
                publicId: null,
              },
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default configurePassport;
