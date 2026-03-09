import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "src/helpers.ts/prisma.js";
import config from "src/config/index.js";
export const seedSuperAdmin = async () => {
    const isExist = await prisma.user.findFirst({
        where: {
            email: config.admin.email,
            role: Role.ADMIN,
        },
    });
    if (!isExist) {
        const hashedPassword = await bcrypt.hash(config.admin.password, config.bcrypt_salt_round);
        await prisma.user.create({
            data: {
                name: config.admin.name,
                email: config.admin.email,
                phone: config.admin.phone,
                password: hashedPassword,
                avatar: config.admin.avatar,
                role: Role.ADMIN,
                isVerified: true,
            },
        });
    }
    else {
        console.log("Super admin already exist.");
    }
};
