import { Prisma } from "@prisma/client";
import { prisma } from "src/helpers.ts/prisma.js";

const createBookings = async (payload: Prisma.BookingCreateInput) => {
  const result = await prisma.booking.create({ data: { ...payload } });
  return result;
};
const getAllBookings = async () => {
  const result = await prisma.booking.findMany();
  return result;
};
const getBookingsById = async (id: string) => {
  const result = await prisma.booking.findUniqueOrThrow({ where: { id } });
  return result;
};
const updateBooking = async (
  id: string,
  payload: Prisma.BookingUpdateInput,
) => {
  const result = await prisma.booking.update({ where: { id }, data: payload });
  return result;
};
const deleteBooking = async (id: string) => {
  const result = await prisma.booking.delete({ where: { id } });
  return result;
};

export const BookingService = {
  createBookings,
  getAllBookings,
  getBookingsById,
  updateBooking,
  deleteBooking,
};
