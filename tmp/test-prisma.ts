import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    const res = await prisma.cart.upsert({
      where: { userId: "some-id" },
      create: { userId: "some-id" },
      update: {},
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
