import { prisma } from "../helpers.ts/prisma.js";

export const seedAdminSettings = async () => {
  try {
    const isExist = await prisma.adminSetting.findUnique({
      where: { id: "1" }
    });

    if (isExist) {
      console.log("Admin Settings with ID '1' already exist. Skipping seeding.");
      return;
    }

    // Clear existing settings to ensure we have exactly one with ID '1'
    await prisma.adminSetting.deleteMany();

    await prisma.adminSetting.create({
      data: {
        id: "1",
        calcellationWindowHours: 2,
        bookingLeadTimeHours: 2,
        requirePaymentUpFront: true,
        allowPartialPayment: true,
        platformCommissionRate: 1.5,
        fixedTransactionFee: 4.99,
        paymentProcessingFee: 2.5,
        payoutSchedule: 'WEEKLY',
      },
    });

    console.log("✅ Default Admin Settings seeded successfully.");
  } catch (error) {
    console.error("Error seeding Admin Settings:", error);
  }
};
