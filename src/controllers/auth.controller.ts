import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';
import nodemailer from 'nodemailer';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { maxAgeAuthToken } from '@/utils/constants';

const secretKey = process.env.JWT_SECRET_KEY as string;
const authTokenName = process.env.AUTH_TOKEN_NAME as string;

const requireAuth = (req: Request, res: Response): void => {
  const { user } = res.locals;

  if (!user) {
    res.json({ notAuthenticated: true });
    return;
  }

  res.status(200).json({ user: { id: user.id, type: user.type } });
  return;
};

const login = async (req: Request, res: Response): Promise<void> => {
  if (authTokenName && secretKey) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const body: {
        email: string;
        password: string;
        type: 'person' | 'organization';
        remember: boolean;
      } = req.body;

      let user = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
        include: {
          userInfos: {
            select: {
              isVerified: true,
            },
          },
        },
      });

      if (!user) {
        res.json({ userNotFound: true });
        return;
      }

      const passwordMatch = await bcrypt.compare(body.password, user.password);

      if (!passwordMatch) {
        res.json({ incorrectPassword: true });
        return;
      }

      if (!user.userInfos?.isVerified) {
        const code = crypto.randomInt(100000, 1000000).toString();

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Net Kids" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: 'Code de vérification',
          html: `<p>Bonjour ${user.name}, votre code de vérification est : <strong>${code}</strong>.</p>`,
        });

        const payload = {
          id: user.id,
          code: code,
        };

        const token = jwt.sign({ infos: payload }, secretKey, {
          expiresIn: maxAgeAuthToken,
        });

        res.json({ token });
        return;
      }

      const infos = {
        id: user.id,
        authToken: true,
      };

      const authToken = jwt.sign({ infos }, secretKey, {
        expiresIn: maxAgeAuthToken,
      });

      const cookieOptions: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: boolean | 'none' | 'lax' | 'strict';
        maxAge?: number;
      } = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      };
      if (body.remember) {
        cookieOptions.maxAge = maxAgeAuthToken;
      }

      res.cookie(authTokenName, authToken, cookieOptions);
      res.status(200).json({ user: { id: user.id } });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ unknownError: error });
      }
    }
  }
};

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const body: {
      name: string;
      email: string;
      password: string;
      type?: 'person' | 'organization';
      secteur?: string;
    } = req.body;

    const type = body.type ?? 'person';

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (user) {
      res.json({ userAlreadyExist: true });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        password: hashedPassword,
        type,
        secteur: type === 'organization' ? (body.secteur ?? '') : null,
      },
    });
    const code = crypto.randomInt(100000, 1000000).toString();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Net Kids" <${process.env.GMAIL_USER}>`,
      to: body.email,
      subject: 'Code de verification',
      html: `<p>Bonjour ${body.name}, votre code de vérification est : <strong >${code}</strong>.</p>`,
    });

    const payload = {
      id: newUser.id,
      code: code,
    };

    const token = jwt.sign({ infos: payload }, secretKey, {
      expiresIn: maxAgeAuthToken,
    });

    res.status(201).json({ token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const logout = async (req: Request, res: Response) => {
  if (authTokenName) {
    res.clearCookie(authTokenName, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.status(200).json({ loggedOut: true });
    return;
  }
};

const oauthRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { token } = req.params;
    const { password }: { password: string } = req.body;

    const decoded = jwt.verify(token, secretKey) as {
      infos: { name: string; email: string; profile: string };
    };

    const { name, email, profile } = decoded.infos;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      res.json({ userAlreadyExist: true });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    if (profile) {
      await prisma.file.create({
        data: {
          src: profile,
          userId: newUser.id,
          type: 'profile',
        },
      });
    }

    await prisma.userInfos.create({
      data: {
        userId: newUser.id,
        isVerified: true,
      },
    });

    const payload = {
      id: newUser.id,
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
    res.status(201).json({
      user: {
        id: newUser.id,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

export { requireAuth, login, register, logout, oauthRegister };
