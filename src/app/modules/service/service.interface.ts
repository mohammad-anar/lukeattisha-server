export type IServiceCreatePayload = {
  categoryId: string;
  name: string;
  basePrice: number;
  isActive?: boolean;
  addons?: string[];
};

export type IServiceUpdatePayload = Partial<IServiceCreatePayload>;

export type IAssignAddonPayload = {
  addonId: string;
};

export type IServiceFilterRequest = {
  searchTerm?: string;
  operatorId?: string;
  categoryId?: string;
  isActive?: string;
  minPrice?: string;
  maxPrice?: string;
};

