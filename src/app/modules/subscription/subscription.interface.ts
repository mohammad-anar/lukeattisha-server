export type ISubscriptionPackageCreatePayload = {
  name: string;
  price: number;
  durationDays: number;
  freeDelivery?: boolean;
};

export type ISubscriptionPackageUpdatePayload = Partial<ISubscriptionPackageCreatePayload>;

export type IUserSubscribePayload = {
  packageId: string;
};
