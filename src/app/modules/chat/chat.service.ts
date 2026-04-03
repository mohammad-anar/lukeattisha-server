import { prisma } from '../../../helpers.ts/prisma.js';
import ApiError from '../../../errors/ApiError.js';

const sendMessage = async (roomId: string, senderId: string, content: string) => {
  // Try to find if sender is a User or Operator
  const participant = await prisma.chatParticipant.findFirst({
    where: {
      roomId,
      OR: [
        { userId: senderId },
        { operatorId: senderId }
      ]
    }
  });

  if (!participant) {
    throw new ApiError(403, 'Sender is not a participant of this room');
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
