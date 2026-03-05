import { JobStatus, Prisma, Urgency } from "@prisma/client";
import { paginationHelper } from "src/helpers.ts/paginationHelper.js";
import { prisma } from "src/helpers.ts/prisma.js";
import { createAndEmitNotification } from "src/helpers.ts/socketHelper.js";
import { IPaginationOptions } from "src/types/pagination.js";

const createJob = async (payload: any) => {
  const job = await prisma.job.create({
    data: {
      ...payload,
      status: JobStatus.OPEN,
    },
  });

  // Geo matching using PostGIS
  const nearbyWorkshops = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Workshop"
    WHERE "approvalStatus" = 'APPROVED'
    AND ST_DWithin(
      location,
      ST_SetSRID(ST_MakePoint(${job.longitude}, ${job.latitude}), 4326)::geography,
      ${job.radius * 1000}
    )
  `;

  const workshopIds = nearbyWorkshops.map((w) => w.id);

  // Create a single notification for all workshops
  await createAndEmitNotification({
    workshopIds, // pass array instead of single workshopId
    jobId: job.id,
    title: "New Job Nearby",
    body: "A new job is available in your area.",
  });

  return job;
};

const getAllJobs = async (
  filter: {
    searchTerm?: string | undefined;
    urgency?: Urgency;
    status?: JobStatus;
  },
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filter;

  const andConditions: Prisma.JobWhereInput[] = [];
  if (filter.searchTerm) {
    andConditions.push({
      OR: ["title", "description"].map((field) => ({
        [field]: {
          contains: filter.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.JobWhereInput = { AND: andConditions };

  const result = await prisma.job.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      title:true,
      description:true,
      address:true,
      bikeName:true,
      bikeType: true,
      bikeBrand:true,
      bikeId:true,
      bike:true,
      city:true,
      photos:true,
      category:true,
    },
  });

  const total = await prisma.job.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getJobById = async (id: string) => {
  const result = await prisma.job.findUniqueOrThrow({ where: { id } });
  return result;
};
const updateJobById = async (id: string, payload: Prisma.JobUpdateInput) => {
  const result = await prisma.job.update({ where: { id }, data: payload });
  return result;
};
const deleteJob = async (id: string) => {
  const result = await prisma.job.delete({ where: { id } });
  return result;
};

export const JobService = {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJob,
};
