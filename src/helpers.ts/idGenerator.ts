import { prisma } from "./prisma.js";

type IdType = 'USER' | 'ORDER' | 'TICKET' | 'REVIEW';

export const generateCustomId = async (type: IdType): Promise<string> => {
  if (type === 'USER') {
    const lastRecord = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { userId: true },
    });
    
    let currentId = 1;
    if (lastRecord?.userId && lastRecord.userId.startsWith('USR')) {
      const match = lastRecord.userId.match(/\d+$/);
      if (match) currentId = parseInt(match[0], 10) + 1;
    }
    return `USR${currentId.toString().padStart(4, '0')}`;
  }

  if (type === 'ORDER') {
    const lastRecord = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderId: true },
    });
    
    let currentId = 1;
    if (lastRecord?.orderId && lastRecord.orderId.startsWith('ORD-')) {
      const parts = lastRecord.orderId.split('-');
      if (parts.length >= 4) {
         currentId = parseInt(parts[parts.length - 1], 10) + 1;
      }
    }
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `ORD-${year}-${month}-${currentId.toString().padStart(4, '0')}`;
  }

  if (type === 'TICKET') {
    const lastRecord = await prisma.supportTicket.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { ticketId: true },
    });
    
    let currentId = 1;
    if (lastRecord?.ticketId && lastRecord.ticketId.startsWith('#')) {
      const match = lastRecord.ticketId.match(/\d+$/);
      if (match) currentId = parseInt(match[0], 10) + 1;
    }
    return `#${currentId.toString().padStart(4, '0')}`;
  }

  if (type === 'REVIEW') {
    const lastRecord = await prisma.serviceReview.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { reviewId: true },
    });
    
    let currentId = 1;
    if (lastRecord?.reviewId && lastRecord.reviewId.startsWith('REV')) {
      const match = lastRecord.reviewId.match(/\d+$/);
      if (match) currentId = parseInt(match[0], 10) + 1;
    }
    return `REV${currentId.toString().padStart(4, '0')}`;
  }
  
  return '';
};
