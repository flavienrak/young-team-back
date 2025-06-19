import prisma from '@/lib/db';

import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { maxAgeAuthToken } from '@/utils/constants';
import { validationResult } from 'express-validator';

const secretKey = process.env.JWT_SECRET_KEY as string;
const authTokenName = process.env.AUTH_TOKEN_NAME as string;

const verifyCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { code } = req.body;
    const { token } = req.params;

    const decoded = jwt.verify(token, secretKey) as JwtPayload & {
      infos: {
        code: string;
        id: string;
      };
    };

    const expectedCode: string | undefined = decoded.infos.code;
    const userId: string | undefined = decoded.infos.id;
    if (expectedCode && code === Number(expectedCode)) {
      const user = await prisma.userInfos.update({
        where: { id: Number(userId) },
        data: { isVerified: true },
      });
      if (!user) {
        res.json({ userNotFound: true });
        return;
      }
      const payload = {
        id: user.id,
        authToken: true,
      };

      const authToken = jwt.sign({ infos: payload }, secretKey, {
        expiresIn: maxAgeAuthToken,
      });

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: maxAgeAuthToken,
      };

      res.cookie(authTokenName, authToken, cookieOptions);
      res.status(200).json({ valid: true });
    } else {
      res.json({ invalid: true });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const verifyToken = (req: Request, res: Response): void => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { token } = req.params;

    jwt.verify(token, secretKey);

    res.status(200).json({ decoded: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const oAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const token = req.params.token;

    let decoded: any;
    try {
      decoded = jwt.verify(token, secretKey) as {
        infos: { email: string; name: string; profile: string };
      };
    } catch (error) {
      res.json({ tokenInvalid: true });
      return;
    }

    const email = decoded.infos.email;

    if (!email) {
      res.json({ emailNotFound: true });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      res.json({ id: user.id });
      return;
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

export { verifyCode, verifyToken, oAuth };
