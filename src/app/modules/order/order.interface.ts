import { OrderStatus, PaymentMethodType } from "@prisma/client";

export type IOrderItemPayload = {
  serviceId: string;
  quantity: number;
  addonIds?: string[];
};

export type IOrderCreatePayload = {
  operatorId: string;
  items: IOrderItemPayload[];
  pickupAt: string; // ISO string for pickup date/time
  dropoffAt: string; // ISO string for dropoff date/time
  pickupAddress: string;
  dropoffAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  specialInstruction?: string;
  paymentMethod: PaymentMethodType;
};

export type IOrderUpdateStatusPayload = {
  status: OrderStatus;
  note?: string;
};

export type IOrderCreateResponse = {
  order: any; // Using any for now to avoid deep listing of the included relations
  paymentUrl: string | null;
};
