export type IOperatorProfileCreatePayload = {
  storeName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type IOperatorProfileUpdatePayload = Partial<IOperatorProfileCreatePayload>;

export type IOperatorCategoryAssignPayload = {
  categoryIds: string[];
};
