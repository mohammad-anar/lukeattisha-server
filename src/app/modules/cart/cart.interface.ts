export type ICartAddPayload = {
  serviceId?: string;
  serviceBundleId?: string;
  quantity?: number;
  addons?: string[]; // Array of addon IDs
};

export type ICartUpdatePayload = {
  quantity?: number;
  addons?: string[]; // Array of addon IDs
};
