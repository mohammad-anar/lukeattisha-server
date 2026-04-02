export type ICategoryCreatePayload = {
  name: string;
};

export type ICategoryUpdatePayload = {
  name?: string;
};

export type ICategoryFilterRequest = {
  searchTerm?: string;
};
