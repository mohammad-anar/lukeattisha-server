import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_round: Number(process.env.BCRYPT_SALT_ROUND),
  cors_origin: process.env.CORS_ORIGIN,
  frontend_url: process.env.FRONTEND_URL,
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
  },
  stripe: {
    stripe_pk: process.env.STRIPE_PUBLISHABLE_KEY,
    stripe_sk: process.env.STRIPE_SECRET_KEY,
    stripe_webhook_secret: process.env.STRIPE_WEBHOOK_SECRET,
    premium_product_id: process.env.STRIPE_PREMIUM_PRODUCT_ID,
    premium_price_id: process.env.STRIPE_PREMIUM_PRICE_ID,
    ad_product_id: process.env.STRIPE_AD_PRODUCT_ID,
    ad_price_id: process.env.STRIPE_AD_PRICE_ID,
    connect_return_url: process.env.STRIPE_CONNECT_RETURN_URL,
    connect_refresh_url: process.env.STRIPE_CONNECT_REFRESH_URL,
  },
  economics: {
    platform_fee_percent: Number(process.env.PLATFORM_FEE_PERCENT) || 10,
    min_payout: Number(process.env.MINIMUM_PAYOUT_AMOUNT) || 50,
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
  },
  admin: {
    name: process.env.NAME,
    email: process.env.EMAIL,
    phone: process.env.PHONE,
    password: process.env.PASSWORD,
    avatar: process.env.AVATAR,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
    facebookClientId: process.env.FACEBOOK_CLIENT_ID,
    facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    facebookCallbackUrl: process.env.FACEBOOK_CALLBACK_URL || '/api/v1/auth/facebook/callback',
  }
};