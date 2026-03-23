export type IReviewCreatePayload = {
  serviceId: string;
  orderId: string;
  rating: number;
  comment?: string;
};

export type IReviewReplyPayload = {
  operatorReply: string;
};
