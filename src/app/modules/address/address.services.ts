import { prisma } from "helpers.ts/prisma.js";

/* ================= CREATE ADDRESS ================= */
const createAddress = async (userId: string, payload: any) => {
  // If this is first address → make it default automatically
  const existingCount = await prisma.userAddress.count({
    where: { userId },
  });

  return await prisma.userAddress.create({
    data: {
      ...payload,
      userId,
      isDefault: existingCount === 0 ? true : false,
    },
  });
};

/* ================= GET MY ADDRESSES ================= */
const getMyAddresses = async (userId: string) => {
  return await prisma.userAddress.findMany({
    where: { userId },
    orderBy: {
      isDefault: "desc",
    },
  });
};

/* ================= GET SINGLE ADDRESS ================= */
const getSingleAddress = async (id: string) => {
  return await prisma.userAddress.findUnique({
    where: { id },
  });
};

/* ================= UPDATE ADDRESS ================= */
const updateAddress = async (id: string, payload: any) => {
  return await prisma.userAddress.update({
    where: { id },
    data: payload,
  });
};

/* ================= DELETE ADDRESS ================= */
const deleteAddress = async (id: string) => {
  return await prisma.userAddress.delete({
    where: { id },
  });
};

/* ================= SET DEFAULT ADDRESS ================= */
const setDefaultAddress = async (userId: string, addressId: string) => {
  // Step 1: remove previous default
  await prisma.userAddress.updateMany({
    where: {
      userId,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  // Step 2: set new default
  return await prisma.userAddress.update({
    where: { id: addressId },
    data: {
      isDefault: true,
    },
  });
};

export const UserAddressService = {
  createAddress,
  getMyAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
