import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createJob = async (payload: Prisma.JobCreateInput) => {
  const result = await prisma.job.create({
    data: payload,
  });

  return result;
};

export const JobService = {
  createJob,
};
