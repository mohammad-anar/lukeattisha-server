import { prisma } from '../../../helpers.ts/prisma.js';
import { OrderStatus, SubscriptionStatus, AdStatus, UserRole } from '@prisma/client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfPrevMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function endOfPrevMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59, 999);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfPrevWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() - 7);
  return d;
}

function endOfPrevWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setSeconds(d.getSeconds() - 1);
  return d;
}

// ─── 1. Stats Summary ─────────────────────────────────────────────────────────

const getStatsSummary = async () => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const prevMonthStart = startOfPrevMonth(now);
  const prevMonthEnd = endOfPrevMonth(now);
  const thisWeekStart = startOfWeek(now);
  const prevWeekStart = startOfPrevWeek(now);
  const prevWeekEnd = endOfPrevWeek(now);

  // ── 1. Total Orders ──────────────────────────────────────────────────────────
  const [totalOrders, prevMonthOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.order.count({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
  ]);

  // ── 2. Net Platform Revenue (platformFee sum from PAID orders) ──────────────
  const [thisMonthRevRaw, prevMonthRevRaw] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: thisMonthStart } },
      _sum: { platformFee: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
      _sum: { platformFee: true },
    }),
  ]);
  const netRevenue = Number(thisMonthRevRaw._sum.platformFee ?? 0);
  const prevNetRevenue = Number(prevMonthRevRaw._sum.platformFee ?? 0);

  // ── 3. Repeated Customer Rate ─────────────────────────────────────────────────
  const userOrderCounts = await prisma.order.groupBy({
    by: ['userId'],
    _count: { id: true },
  });
  const totalUsers = userOrderCounts.length;
  const repeatedUsers = userOrderCounts.filter((u) => u._count.id > 1).length;
  const repeatedCustomerRate = totalUsers > 0 ? parseFloat(((repeatedUsers / totalUsers) * 100).toFixed(2)) : 0;

  // ── 4. New Customers ───────────────────────────────────────────────────────────
  const [newCustomers, prevNewCustomers] = await Promise.all([
    prisma.user.count({
      where: { role: UserRole.USER, createdAt: { gte: thisMonthStart } },
    }),
    prisma.user.count({
      where: { role: UserRole.USER, createdAt: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),
  ]);

  // ── 5. Cancellation Rate ───────────────────────────────────────────────────────
  const [thisCancelled, thisTotalOrders, prevCancelled, prevTotalOrdersCount] = await Promise.all([
    prisma.order.count({ where: { status: OrderStatus.CANCELLED, createdAt: { gte: thisMonthStart } } }),
    prisma.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.order.count({ where: { status: OrderStatus.CANCELLED, createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
    prisma.order.count({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
  ]);
  const cancellationRate = thisTotalOrders > 0 ? parseFloat(((thisCancelled / thisTotalOrders) * 100).toFixed(2)) : 0;
  const prevCancellationRate = prevTotalOrdersCount > 0 ? parseFloat(((prevCancelled / prevTotalOrdersCount) * 100).toFixed(2)) : 0;

  // ── 6. On-Time Completion Rate (this week vs prev week) ─────────────────────
  const [thisWeekCompleted, thisWeekTotal, prevWeekCompleted, prevWeekTotal] = await Promise.all([
    prisma.order.count({ where: { status: OrderStatus.DELIVERED, createdAt: { gte: thisWeekStart } } }),
    prisma.order.count({ where: { createdAt: { gte: thisWeekStart } } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED, createdAt: { gte: prevWeekStart, lte: prevWeekEnd } } }),
    prisma.order.count({ where: { createdAt: { gte: prevWeekStart, lte: prevWeekEnd } } }),
  ]);
  const onTimeRate = thisWeekTotal > 0 ? parseFloat(((thisWeekCompleted / thisWeekTotal) * 100).toFixed(2)) : 0;
  const prevOnTimeRate = prevWeekTotal > 0 ? parseFloat(((prevWeekCompleted / prevWeekTotal) * 100).toFixed(2)) : 0;

  // ── 7. Avg Support Tickets per month ─────────────────────────────────────────
  const [thisMonthTickets, prevMonthTickets] = await Promise.all([
    prisma.supportTicket.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.supportTicket.count({ where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd } } }),
  ]);

  // ── 8. Active Operators ────────────────────────────────────────────────────────
  const activeOperators = await prisma.operator.count({
    where: { status: 'ACTIVE', approvalStatus: 'APPROVED' },
  });

  // ── 9. Membership Count (in-app purchase = UserSubscription ACTIVE) ───────────
  const membershipCount = await prisma.userSubscription.count({
    where: { status: SubscriptionStatus.ACTIVE },
  });

  // ── 10. Active Ads ─────────────────────────────────────────────────────────────
  const activeAds = await prisma.ad.count({
    where: { status: AdStatus.ACTIVE },
  });

  // ── 11. Total GMV (sum of totalAmount for all PAID orders ever) ───────────────
  const gmvRaw = await prisma.order.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { totalAmount: true },
  });
  const totalGMV = Number(gmvRaw._sum.totalAmount ?? 0);

  // ── 12. Gross Revenue for admin/platform (platformFee all time) ───────────────
  const grossRevRaw = await prisma.order.aggregate({
    where: { paymentStatus: 'PAID' },
    _sum: { platformFee: true },
  });
  const grossRevenue = Number(grossRevRaw._sum.platformFee ?? 0);

  return {
    totalOrders: {
      value: totalOrders,
      change: pctChange(totalOrders, prevMonthOrders),
      direction: totalOrders >= prevMonthOrders ? 'up' : 'down',
    },
    netPlatformRevenue: {
      value: netRevenue,
      change: pctChange(netRevenue, prevNetRevenue),
      direction: netRevenue >= prevNetRevenue ? 'up' : 'down',
    },
    repeatedCustomerRate: {
      value: repeatedCustomerRate,
    },
    newCustomers: {
      value: newCustomers,
      change: pctChange(newCustomers, prevNewCustomers),
      direction: newCustomers >= prevNewCustomers ? 'up' : 'down',
    },
    cancellationRate: {
      value: cancellationRate,
      change: pctChange(cancellationRate, prevCancellationRate),
      direction: cancellationRate <= prevCancellationRate ? 'up' : 'down',
    },
    onTimeCompletionRate: {
      value: onTimeRate,
      change: pctChange(onTimeRate, prevOnTimeRate),
      direction: onTimeRate >= prevOnTimeRate ? 'up' : 'down',
      comparedTo: 'last week',
    },
    avgSupportTickets: {
      value: thisMonthTickets,
      change: pctChange(thisMonthTickets, prevMonthTickets),
      direction: thisMonthTickets <= prevMonthTickets ? 'up' : 'down',
    },
    activeOperators: {
      value: activeOperators,
    },
    membershipCount: {
      value: membershipCount,
    },
    activeAds: {
      value: activeAds,
    },
    totalGMV: {
      value: totalGMV,
    },
    grossRevenue: {
      value: grossRevenue,
    },
  };
};

// ─── 2. Revenue Chart ─────────────────────────────────────────────────────────
// filter: 'weekly' | 'monthly' | '3' | '6' | '12'
// weekly  → last 7 days, daily buckets  (label: 'Apr 8')
// monthly → current month days 1→today (label: 'Apr 1')
// 3/6/12  → last N months, monthly buckets (label: 'Apr 2026')

const getMonthlyRevenueChart = async (filter: 'weekly' | 'monthly' | '3' | '6' | '12') => {
  const now = new Date();
  const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── weekly: last 7 days, one bucket per day ─────────────────────────────────
  if (filter === 'weekly') {
    const results: { label: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const agg = await prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: start, lte: end } },
        _sum: { platformFee: true },
      });
      const label = `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
      results.push({ label, revenue: Number(agg._sum.platformFee ?? 0) });
    }
    return results;
  }

  // ── monthly: days 1 → today of the current month ───────────────────────────
  if (filter === 'monthly') {
    const results: { label: string; revenue: number }[] = [];
    const year  = now.getFullYear();
    const month = now.getMonth();
    // Total days in current month (e.g. 30 for April, 31 for May)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const start = new Date(year, month, day, 0, 0, 0);
      const end   = new Date(year, month, day, 23, 59, 59, 999);
      const agg = await prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: start, lte: end } },
        _sum: { platformFee: true },
      });
      const label = `${MONTH_SHORT[month]} ${day}`;
      results.push({ label, revenue: Number(agg._sum.platformFee ?? 0) });
    }
    return results;
  }

  // ── 3 / 6 / 12: last N months, one bucket per month ────────────────────────
  const months = parseInt(filter) as 3 | 6 | 12;
  const results: { month: string; revenue: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date  = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const agg = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: start, lte: end } },
      _sum: { platformFee: true },
    });
    const monthLabel = `${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
    results.push({ month: monthLabel, revenue: Number(agg._sum.platformFee ?? 0) });
  }
  return results;
};

// ─── 3. Orders Chart (weekly/monthly/yearly) ───────────────────────────────────

const getOrdersChart = async (period: 'weekly' | 'monthly' | 'yearly') => {
  const now = new Date();
  const results: { label: string; count: number }[] = [];

  if (period === 'weekly') {
    // Last 7 days — day by day
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const count = await prisma.order.count({ where: { createdAt: { gte: start, lte: end } } });
      results.push({ label: DAY_NAMES[d.getDay()], count });
    }
  } else if (period === 'monthly') {
    // All days of current month, label: 'Apr 1'
    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year  = now.getFullYear();
    const month = now.getMonth();
    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const start = new Date(year, month, day, 0, 0, 0);
      const end   = new Date(year, month, day, 23, 59, 59, 999);
      const count = await prisma.order.count({ where: { createdAt: { gte: start, lte: end } } });
      const label = `${MONTH_SHORT[month]} ${day}`;
      results.push({ label, count });
    }
  } else {
    // yearly — last 12 months
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const count = await prisma.order.count({ where: { createdAt: { gte: start, lte: end } } });
      results.push({ label: MONTH_NAMES[date.getMonth()], count });
    }
  }

  return { period, data: results };
};

// ─── 4. Order Status Pie Chart ─────────────────────────────────────────────────

const getOrderStatusChart = async () => {
  const statuses = [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.PICKED_UP,
    OrderStatus.READY_FOR_DELIVERY,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  const result = await Promise.all(
    statuses.map(async (status) => {
      const count = await prisma.order.count({ where: { status } });
      return { status, count };
    }),
  );

  const total = result.reduce((sum, r) => sum + r.count, 0);
  return result.map((r) => ({
    ...r,
    percentage: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(2)) : 0,
  }));
};

// ─── 5. Top Operators by Success Rate ─────────────────────────────────────────

const getTopOperators = async (limit = 10) => {
  const operators = await prisma.operator.findMany({
    where: { approvalStatus: 'APPROVED' },
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      stores: { select: { id: true, name: true } },
      operatorOrders: {
        select: { id: true, order: { select: { status: true } } },
      },
    },
  });

  const mapped = operators.map((op) => {
    const totalOrders = op.operatorOrders.length;
    const completedOrders = op.operatorOrders.filter(
      (oo) => oo.order.status === OrderStatus.DELIVERED,
    ).length;
    const successRate = totalOrders > 0 ? parseFloat(((completedOrders / totalOrders) * 100).toFixed(2)) : 0;

    return {
      operatorId: op.id,
      name: op.user.name,
      email: op.user.email,
      avatar: op.user.avatar,
      storeCount: op.stores.length,
      stores: op.stores,
      totalOrders,
      completedOrders,
      successRate,
    };
  });

  return mapped.sort((a, b) => b.successRate - a.successRate).slice(0, limit);
};

// ─── 6. Store Performance ─────────────────────────────────────────────────────

const getStorePerformance = async (month: number, year: number) => {
  const thisMonthStart = new Date(year, month - 1, 1);
  const thisMonthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  const prevMonthStart = new Date(year, month - 2, 1);
  const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

  const stores = await prisma.store.findMany({
    select: {
      id: true,
      name: true,
      operatorOrders: {
        select: {
          subtotal: true,
          createdAt: true,
          order: { select: { status: true } },
        },
        where: {
          createdAt: {
            gte: prevMonthStart,
            lte: thisMonthEnd,
          },
        },
      },
    },
  });

  return stores.map((store) => {
    const thisMonthOrders = store.operatorOrders.filter(
      (oo) => oo.createdAt >= thisMonthStart && oo.createdAt <= thisMonthEnd,
    );
    const prevMonthOrders = store.operatorOrders.filter(
      (oo) => oo.createdAt >= prevMonthStart && oo.createdAt <= prevMonthEnd,
    );

    const currentSales = thisMonthOrders.reduce((sum, oo) => sum + Number(oo.subtotal), 0);
    const previousSales = prevMonthOrders.reduce((sum, oo) => sum + Number(oo.subtotal), 0);
    const growth = pctChange(currentSales, previousSales);

    let status: 'excellent' | 'good' | 'declining';
    if (growth >= 10) status = 'excellent';
    else if (growth >= 0) status = 'good';
    else status = 'declining';

    return {
      storeId: store.id,
      storeName: store.name,
      currentSales: parseFloat(currentSales.toFixed(2)),
      previousSales: parseFloat(previousSales.toFixed(2)),
      growth,
      direction: growth >= 0 ? 'up' : 'down',
      status,
    };
  });
};

export const AdminAnalyticsService = {
  getStatsSummary,
  getMonthlyRevenueChart,
  getOrdersChart,
  getOrderStatusChart,
  getTopOperators,
  getStorePerformance,
};
