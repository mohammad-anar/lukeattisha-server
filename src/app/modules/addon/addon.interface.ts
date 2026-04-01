export type IAddonCreatePayload = {
  name: string;
  price: number;
};

export type IAddonUpdatePayload = Partial<IAddonCreatePayload>;

export type IAddonFilterRequest = {
  searchTerm?: string;
  operatorId?: string;
  minPrice?: string;
  maxPrice?: string;
};

