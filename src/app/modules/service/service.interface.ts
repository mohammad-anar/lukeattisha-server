export type IServiceCreatePayload = {
  categoryId: string;
  name: string;
  basePrice: number;
  isActive?: boolean;
};

export type IServiceUpdatePayload = Partial<IServiceCreatePayload>;

export type IAddonCreatePayload = {
  name: string;
  price: number;
};

export type IAddonUpdatePayload = Partial<IAddonCreatePayload>;
