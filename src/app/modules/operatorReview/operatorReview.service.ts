import { Prisma } from '@prisma/client';
import { prisma } from '../../../helpers.ts/prisma.js';
import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';
import { IPaginationOptions } from '../../../types/pagination.js';


const getReviews = async (
  operatorId: string,
  filters: {
    rating?: string;
    serviceType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  },
  paginationOptions: IPaginationOptions,
): Promise<{ meta: { page: number; limit: number; total: number }; data: any[] }> => {
  const { rating, serviceType, sortBy, sortOrder } = filters;
  const { limit, page, skip } = paginationHelper.calculatePagination(paginationOptions);

  const where: Prisma.ReviewWhereInput = {
    OR: [
      { service: { store: { operatorId } } },
      { bundle: { store: { operatorId } } },
    ],
  };

  // 1. Rating Filtering
  if (filters.rating) {
    if (filters.rating.endsWith('+')) {
      const minRating = parseInt(filters.rating.replace('+', ''));
      where.rating = { gte: minRating };
    } else {
      where.rating = parseInt(filters.rating);
    }
  }

  // 2. Service Type Filtering
  if (filters.serviceType) {
    where.OR = [
      { service: { service: { name: filters.serviceType }, store: { operatorId } } },
      { bundle: { bundle: { name: filters.serviceType }, store: { operatorId } } },
    ];
  }

  // 3. Sorting
  let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
  if (sortBy === 'rating') {
    orderBy = { rating: sortOrder || 'desc' };
  } else if (sortBy === 'createdAt') {
    orderBy = { createdAt: sortOrder || 'desc' };
  }

  const [result, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, avatar: true } },
        service: {
          include: {
            service: { select: { name: true } },
            store: { select: { name: true } },
          },
        },
        bundle: {
          include: {
            bundle: { select: { name: true } },
            store: { select: { name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getRatingStats = async (operatorId: string, storeId?: string) => {
  const where: Prisma.ReviewWhereInput = {
    OR: [
      { service: { store: { operatorId } } },
      { bundle: { store: { operatorId } } },
    ],
  };
  if (storeId) {
    where.OR = [
      { service: { storeId } },
      { bundle: { storeId } },
    ];
  }

  const [avgResult, distributionResult] = await Promise.all([
    // Average
    prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: { id: true },
    }),
    // Distribution
    prisma.review.groupBy({
      by: ['rating'],
      where,
      _count: { id: true },
    }),
  ]);

  const avgRating = avgResult._avg?.rating || 0;
  const totalReviews = avgResult._count?.id || 0;

  // Initialize distribution with 0s
  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distributionResult.forEach((item) => {
    distribution[item.rating] = item._count.id;
  });

  return {
    averageRating: parseFloat(avgRating.toFixed(1)),
    totalReviews,
    distribution: Object.entries(distribution).map(([star, count]) => ({
      rating: parseInt(star),
      count,
    })),
  };
};

export const OperatorReviewService = {
  getReviews,
  getRatingStats,
};
