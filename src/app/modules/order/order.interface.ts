import { OrderStatus, PaymentMethodType } from "@prisma/client";

export type IOrderItemPayload = {
  serviceId: string;
  quantity: number;
  addonIds?: string[];
};

export type IOrderCreatePayload = {
  operatorId: string;
  items: IOrderItemPayload[];
  pickupDate: string;
  pickupTimeRange: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  specialInstruction?: string;
  paymentMethod: PaymentMethodType;
};

export type IOrderUpdateStatusPayload = {
  status: OrderStatus;
  note?: string;
};
