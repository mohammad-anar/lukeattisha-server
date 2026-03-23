export type ITicketCreatePayload = {
  subject: string;
  description: string;
  orderId?: string;
};

export type ITicketMessageCreatePayload = {
  content: string;
};
