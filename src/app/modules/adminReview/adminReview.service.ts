import { prisma } from '../../../helpers.ts/prisma.js';
import { UserRole } from '@prisma/client';

const getReviewStats = async () => {
  const [totalReviews, ratings] = await Promise.all([
    prisma.review.count(),
    prisma.review.groupBy({
      by: ['rating'],
      _count: { rating: true },
    }),
  ]);

  let sum = 0;
  let positive = 0;
  let negative = 0;

  ratings.forEach((r) => {
    sum += r.rating * r._count.rating;
    if (r.rating >= 4) positive += r._count.rating;
    if (r.rating <= 2) negative += r._count.rating;
  });

  const overallRating = totalReviews > 0 ? parseFloat((sum / totalReviews).toFixed(1)) : 0;

  return {
    overallRating,
    totalReviews,
    positiveReviews: positive,
    negativeReviews: negative,
  };
};

const getReviewsByRatingChart = async () => {
  const ratings = await prisma.review.groupBy({
    by: ['rating'],
    _count: { rating: true },
  });

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    counts[r.rating] = r._count.rating;
  });

  return [
    { rating: '5 Stars', count: counts[5] },
    { rating: '4 Stars', count: counts[4] },
    { rating: '3 Stars', count: counts[3] },
    { rating: '2 Stars', count: counts[2] },
    { rating: '1 Star', count: counts[1] },
  ];
};

const getReviewTrendChart = async () => {
  // Last 30 days trend
  const trend = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const reviews = await prisma.review.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { rating: true },
    });

    const avg = reviews.length > 0 
      ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

    trend.push({
      date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rating: avg,
    });
  }

  return trend;
};

const getTopOperatorsByRating = async () => {
  // This is a bit complex as reviews are linked via services/bundles to stores to operators
  const operators = await prisma.operator.findMany({
    include: {
      user: { select: { name: true } },
      stores: {
        include: {
          storeServices: { include: { reviews: true } },
          storeBundles: { include: { reviews: true } },
        },
      },
    },
  });

  const results = operators.map((op) => {
    let allReviews: any[] = [];
    op.stores.forEach((store) => {
      store.storeServices.forEach((ss) => (allReviews = [...allReviews, ...ss.reviews]));
      store.storeBundles.forEach((sb) => (allReviews = [...allReviews, ...sb.reviews]));
    });

    const total = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total > 0 ? parseFloat((sum / total).toFixed(1)) : 0;
    const positive = allReviews.filter((r) => r.rating >= 4).length;
    const negative = allReviews.filter((r) => r.rating <= 2).length;

    return {
      operatorName: op.user.name,
      avgRating: avg,
      totalReviews: total,
      positive,
      negative,
    };
  });

  return results
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 10)
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
};

export const AdminReviewService = {
  getReviewStats,
  getReviewsByRatingChart,
  getReviewTrendChart,
  getTopOperatorsByRating,
};
