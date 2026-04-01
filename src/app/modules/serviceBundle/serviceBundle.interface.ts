export type IServiceBundleCreatePayload = {
  name: string;
  description?: string;
  image?: string;
  bundlePrice: number | string;
  serviceIds: string[];
};

export type IServiceBundleUpdatePayload = Partial<IServiceBundleCreatePayload>;

export type IServiceBundleFilterRequest = {
  searchTerm?: string;
  operatorId?: string;
};
