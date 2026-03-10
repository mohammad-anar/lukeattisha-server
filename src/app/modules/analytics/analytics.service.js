import { prisma } from "src/helpers.ts/prisma.js";
const getUserAnalytics = async (userId) => {
    const totalJobs = await prisma.job.count({ where: { userId } });
    const bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
            offer: true,
        }
    });
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
    const totalCompletedBookings = completedBookings.length;
    const totalSpent = completedBookings.reduce((sum, b) => sum + (b.offer?.price || 0), 0);
    const reviewsGiven = await prisma.review.count({ where: { userId } });
    return {
        totalJobs,
        totalBookings,
        totalCompletedBookings,
        totalSpent,
        reviewsGiven,
    };
};
const getWorkshopAnalytics = async (workshopId) => {
    const workshop = await prisma.workshop.findUnique({
        where: { id: workshopId },
        select: { avgRating: true, reviewsCount: true }
    });
    const totalOffersMade = await prisma.jobOffer.count({ where: { workshopId } });
    const bookings = await prisma.booking.findMany({
        where: { workshopId },
        include: {
            offer: true,
        }
    });
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS").length;
    const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;
    const totalRevenue = bookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => sum + (b.offer?.price || 0), 0);
    return {
        totalOffersMade,
        totalBookings,
        activeBookings,
        completedBookings,
        totalRevenue,
        avgRating: workshop?.avgRating || 0,
        reviewsCount: workshop?.reviewsCount || 0,
    };
};
const getAdminAnalytics = async () => {
    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const totalWorkshops = await prisma.workshop.count();
    const totalJobs = await prisma.job.count();
    const totalBookings = await prisma.booking.count();
    const completedBookings = await prisma.booking.findMany({
        where: { status: "COMPLETED" },
        include: { offer: true }
    });
    const totalPlatformRevenue = completedBookings.reduce((sum, b) => sum + (b.offer?.price || 0), 0);
    // Status Breakdowns
    const workshopsByStatusRaw = await prisma.workshop.groupBy({
        by: ['approvalStatus'],
        _count: { approvalStatus: true }
    });
    const workshopsByStatus = workshopsByStatusRaw.reduce((acc, curr) => {
        acc[curr.approvalStatus] = curr._count.approvalStatus;
        return acc;
    }, {});
    const jobsByStatusRaw = await prisma.job.groupBy({
        by: ['status'],
        _count: { status: true }
    });
    const jobsByStatus = jobsByStatusRaw.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
    }, {});
    const bookingsByStatusRaw = await prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true }
    });
    const bookingsByStatus = bookingsByStatusRaw.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
    }, {});
    return {
        overview: {
            totalUsers,
            totalWorkshops,
            totalJobs,
            totalBookings,
            totalPlatformRevenue,
        },
        statusBreakdowns: {
            workshops: workshopsByStatus,
            jobs: jobsByStatus,
            bookings: bookingsByStatus,
        }
    };
};
export const AnalyticsService = {
    getUserAnalytics,
    getWorkshopAnalytics,
    getAdminAnalytics,
};
