import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createJobOffer = async (payload: Prisma.JobOfferCreateInput) => {
  const result = await prisma.jobOffer.create({ data: payload });
  return result;
};
const getOfferById = async (id: string) => {
  const result = await prisma.jobOffer.findUniqueOrThrow({ where: { id } });
  return result;
};
const updateOfferById = async (
  id: string,
  payload: Prisma.JobOfferUpdateInput,
) => {
  const result = await prisma.jobOffer.update({ where: { id }, data: payload });
  return result;
};
const deleteOffer = async (id: string) => {
  const result = await prisma.jobOffer.delete({ where: { id } });
  return result;
};

export const JobOfferServices = {
  createJobOffer,
  getOfferById,
  updateOfferById,
  deleteOffer,
};
