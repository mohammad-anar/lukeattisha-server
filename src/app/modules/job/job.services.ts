import { Prisma } from "@prisma/client";

const createJob = async (payload: Prisma.JobCreateInput) => {
  console.log("Job created");
};

export const JobService = {
  createJob,
};
