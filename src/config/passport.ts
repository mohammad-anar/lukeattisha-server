import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { config } from "./index.js";
import { prisma } from "../helpers.ts/prisma.js";
import bcrypt from "bcryptjs";
import { jwtHelper } from "../helpers.ts/jwtHelper.js";
import { generateCustomId } from "../helpers.ts/idGenerator.js";
import { emailHelper } from "../helpers.ts/emailHelper.js";
import { NotificationService } from "../app/modules/notification/notification.service.js";

// Helper to create or login user via OAuth
const handleOAuthLogin = async (profile: any, email: string) => {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash("12345678", Number(config.bcrypt_salt_round));
    const customUserId = await generateCustomId('USER');
    user = await prisma.user.create({
      data: {
        email,
        name: profile.displayName || "OAuth User",
        password: hashedPassword,
        isVerified: true,
        userId: customUserId,
        notificationPref: { create: {} }
      },
    });

    // Send Email
    await emailHelper.sendEmail({
      to: email,
      subject: 'Welcome to Laundry Link - Please Update Your Password',
      html: `
        <h1>Welcome ${user.name}!</h1>
        <p>Your account has been created via social login.</p>
        <p>For your security, we have set a default password for you: <strong>12345678</strong></p>
        <p>Please log in and update your password as soon as possible.</p>
      `
    });

    // Create Notification
    await NotificationService.create({
      userId: user.id,
      title: 'Update Your Password',
      message: 'Your account was created via social login. Please change your default password (12345678) for better security.',
      type: 'SYSTEM'
    });
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
    config.jwt.jwt_expire_in as any,
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
