import { prisma } from "src/helpers.ts/prisma.js";
import { IPlatformDataUpdatePayload } from "./platformData.interface.js";

// Ensures only one PlatformData record exists (singleton pattern)
const getPlatformData = async () => {
  let platformData = await prisma.platformData.findFirst();

  if (!platformData) {
    platformData = await prisma.platformData.create({
      data: {
        platformFee: 0,
        maximumJobRadius: 0,
      },
    });
  }

  return platformData;
};

const updatePlatformData = async (payload: IPlatformDataUpdatePayload) => {
  const existing = await getPlatformData();

  const result = await prisma.platformData.update({
    where: { id: existing.id },
    data: payload,
  });

  return result;
};

export const PlatformDataService = {
  getPlatformData,
  updatePlatformData,
};
