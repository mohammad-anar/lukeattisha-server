import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createJobOffer = async (payload: Prisma.JobOfferCreateInput) => {
  const result = await prisma.jobOffer.create({ data: payload });
  return result;
};

export const JobOfferServices = { createJobOffer };
