import { prisma } from "../helpers.ts/prisma.js";
import { config } from "../config/index.js";
import bcrypt from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const adminConfig = config.admin;
    
    if (!adminConfig.email || !adminConfig.password) {
      console.error("Super Admin config missing in .env");
      return;
    }

    const isExist = await prisma.user.findUnique({
      where: { email: adminConfig.email },
    });

    if (isExist) {
      console.log("Super Admin already exists. Skipping seeding.");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminConfig.password, config.bcrypt_salt_round);

    const superAdmin = await prisma.user.create({
      data: {
        name: adminConfig.name || "Super Admin",
        email: adminConfig.email,
        phone: adminConfig.phone,
        password: hashedPassword,
        avatar: adminConfig.avatar,
        role: "SUPER_ADMIN",
        isVerified: true,
      },
    });

    // Initialize Admin Wallet if it doesn't exist
    await prisma.adminWallet.upsert({
      where: { userId: superAdmin.id },
      update: {},
      create: { userId: superAdmin.id, balance: 0 },
    });

    console.log("✅ Super Admin seeded successfully.");
  } catch (error) {
    console.error("Error seeding Super Admin:", error);
  } finally {
    // await prisma.$disconnect(); 
    // Usually, we don't want to disconnect if the server is still running and using prisma.
    // However, if this was a standalone script, disconnect makes sense.
    // In server.ts, we probably shouldn't disconnect here.
  }
};
