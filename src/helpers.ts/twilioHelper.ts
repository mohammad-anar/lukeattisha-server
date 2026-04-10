import twilio from 'twilio';
import { config } from '../config/index.js';
import { prisma } from './prisma.js';

const client = config.twilio.accountSid && config.twilio.authToken 
  ? twilio(config.twilio.accountSid, config.twilio.authToken)
  : null;

/**
 * Send an SMS message using Twilio
 * @param to Phone number to send to
 * @param body Message content
 * @returns Twilio MessageInstance or null if Twilio is not configured
 */
export const sendSms = async (to: string, body: string, userId?: string) => {
  if (!client || !config.twilio.phoneNumber) {
    console.warn('Twilio is not configured. SMS not sent:', { to, body });
    return null;
  }

  if (userId) {
    const userPref = await prisma.userNotificationPreference.findUnique({
      where: { userId }
    });
    if (userPref && userPref.sms === false) {
      console.log(`Twilio Service: Blocked SMS to [${to}] due to user preference`);
      return null;
    }
  }

  try {
    const message = await client.messages.create({
      body,
      from: config.twilio.phoneNumber,
      to,
    });
    console.log(`SMS sent to ${to}. Message SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error);
    throw error;
  }
};
