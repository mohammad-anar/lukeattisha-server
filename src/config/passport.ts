import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { config } from "./index.js";
import { prisma } from "../helpers.ts/prisma.js";
import bcrypt from "bcryptjs";
import { jwtHelper } from "../helpers.ts/jwtHelper.js";

// Helper to create or login user via OAuth
const handleOAuthLogin = async (profile: any, email: string) => {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash("12345678", config.bcrypt_salt_round);
    user = await prisma.user.create({
      data: {
        email,
        name: profile.displayName || "OAuth User",
        password: hashedPassword,
        isVerified: true,
      },
    });
    // Send email "you should change your password now" logic can be hooked here
  }

  const payload = {
    id: user.id,
    userId: user.userId,
    email: user.email,
    role: user.role,
  };

  const token = jwtHelper.createToken(
    payload,
    config.jwt.jwt_secret as string,
    config.jwt.jwt_expire_in as string
  );

  return token;
};

if (config.oauth.googleClientId && config.oauth.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.googleClientId,
        clientSecret: config.oauth.googleClientSecret,
        callbackURL: config.oauth.googleCallbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) return done(new Error("No email found from Google profile"));
          const token = await handleOAuthLogin(profile, email);
          done(null, { token });
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
}

if (config.oauth.facebookClientId && config.oauth.facebookClientSecret) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.oauth.facebookClientId,
        clientSecret: config.oauth.facebookClientSecret,
        callbackURL: config.oauth.facebookCallbackUrl,
        profileFields: ["id", "emails", "name", "displayName"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value;
          if (!email) return done(new Error("No email found from Facebook profile"));
          const token = await handleOAuthLogin(profile, email);
          done(null, { token });
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
}

export default passport;
