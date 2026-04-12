import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const sendMessage = async (roomId: string, senderId: string, content: string) => {
  let participant = await prisma.chatParticipant.findFirst({
    where: {
      roomId,
      OR: [
        { userId: senderId },
        { operatorId: senderId }
      ]
    }
  });

  if (!participant) {
    // If they aren't a participant, check if they are an ADMIN/SUPER_ADMIN and auto-join them
    const user = await prisma.user.findUnique({ where: { id: senderId } });
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      participant = await prisma.chatParticipant.create({
        data: { roomId, userId: senderId }
      });
    } else {
      throw new ApiError(403, 'Sender is not a participant of this room');
    }
  }

  const result = await prisma.chatMessage.create({
    data: {
      roomId,
      content,
      senderUserId: participant.userId,
      senderOperatorId: participant.operatorId
    },
    include: {
      senderUser: {
        select: { id: true, name: true, avatar: true }
      },
      senderOperator: {
        select: { id: true, user: { select: { id: true, name: true, avatar: true } } }
      }
    }
  });

  return result;
};

export const ChatService = {
  sendMessage
};
