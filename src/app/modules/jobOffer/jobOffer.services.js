import { prisma } from "src/helpers.ts/prisma.js";
const createJobOffer = async (payload) => {
    const result = await prisma.jobOffer.create({ data: payload });
    return result;
};
const getOfferById = async (id) => {
    const result = await prisma.jobOffer.findUniqueOrThrow({ where: { id } });
    return result;
};
const updateOfferById = async (id, payload) => {
    const result = await prisma.jobOffer.update({ where: { id }, data: payload });
    return result;
};
const deleteOffer = async (id) => {
    const result = await prisma.jobOffer.delete({ where: { id } });
    return result;
};
export const JobOfferServices = {
    createJobOffer,
    getOfferById,
    updateOfferById,
    deleteOffer,
};
