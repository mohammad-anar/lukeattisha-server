import { prisma } from './src/helpers.ts/prisma.js';

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'ai.anarul4232@gmail.com' }
    });
    console.log('Search result:', user);
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
