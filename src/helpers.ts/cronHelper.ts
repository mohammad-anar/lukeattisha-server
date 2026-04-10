import cron from 'node-cron';
import { prisma } from './prisma.js';

export const initCronJobs = () => {
  // Run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] 🕒 Running daily subscription checks...');
    const now = new Date();

    try {
      // 1. Expire Operator Ad Subscriptions that have passed their end date
      const expiredAds = await prisma.adSubscription.updateMany({
        where: {
          status: 'ACTIVE',
          endDate: { lt: now },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      if (expiredAds.count > 0) {
        console.log(`[CRON] ⬇️ Expired ${expiredAds.count} operator ad subscriptions.`);
      }

      // 2. Expire User Subscriptions that have passed their end date
      const expiredUserSubs = await prisma.userSubscription.findMany({
        where: {
          status: 'ACTIVE',
          endDate: { lt: now },
        },
      });

      if (expiredUserSubs.length > 0) {
        // Need to update the subscriptions AND the User isSubscribed flag
        const subIds = expiredUserSubs.map(s => s.id);
        const userIds = expiredUserSubs.map(s => s.userId);

        await prisma.$transaction([
          prisma.userSubscription.updateMany({
            where: { id: { in: subIds } },
            data: { status: 'EXPIRED' },
          }),
          prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { isSubscribed: false },
          }),
        ]);

        console.log(`[CRON] ⬇️ Expired ${expiredUserSubs.length} user subscriptions.`);
      }

      console.log('[CRON] ✅ Daily subscription checks completed.');
    } catch (error) {
      console.error('[CRON ❌ ERROR] Failed during daily subscription check:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
};
