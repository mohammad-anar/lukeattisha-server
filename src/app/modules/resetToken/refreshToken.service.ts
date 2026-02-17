import express, { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret, SignOptions } from 'jsonwebtoken';

const router = express.Router();

router.get(
  '/',
  catchAsync(async (req: Request, res: Response) => {
    const tokenWithBearer = req.headers.authorization;
    let accessToken;

    if (!tokenWithBearer) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
    }

    if (tokenWithBearer && !tokenWithBearer.startsWith('Bearer')) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Invalid Token format! Token must startsWith Bearer',
      );
    }

    if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
      const token = tokenWithBearer.split(' ')[1];

      //verify token
      const verifyUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret,
      );

      if (verifyUser) {
        const { exp, iat, ...payloadWithoutExp } = verifyUser;

        const token = jwtHelper.createToken(
          payloadWithoutExp,
          config.jwt.jwt_secret as Secret,
          config.jwt.jwt_expire_in as SignOptions['expiresIn'],
        );
        accessToken = token;
      }
    }

    sendResponse(res, {
      success: true,
      message: 'Access token retrieve successfully',
      statusCode: 200,
      data: { accessToken },
    });
  }),
);

export const RefreshTokenRouter = router;
