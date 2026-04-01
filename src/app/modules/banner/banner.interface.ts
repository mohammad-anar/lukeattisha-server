export type IBanner = {
  id: string;
  title: string;
  description?: string;
  buttonText?: string;
  bannerType?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type IBannerCreatePayload = {
  title: string;
  description?: string;
  buttonText?: string;
  bannerType?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive?: boolean;
  image?: string;
};

export type IBannerUpdatePayload = Partial<IBannerCreatePayload>;
