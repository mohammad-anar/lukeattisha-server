import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedCategories = async () => {
  try {
    const categoryCount = await prisma.category.count();

    if (categoryCount === 0) {
      console.log('Seeding initial categories...');

      const defaultCategories = ['Wash', 'DryClean', 'Fold'];

      for (const name of defaultCategories) {
        const existing = await prisma.category.findFirst({ where: { name } });
        if (!existing) {
          await prisma.category.create({
            data: {
              name,
              description: `Default category for ${name}`,
              isActive: true,
            },
          });
        }
      }

      console.log('✅ Categories seeded successfully.');
    } else {
      console.log('Categories already exist. Skipping seeding.');
    }
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};
