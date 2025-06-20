import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import isEmpty from '@/utils/isEmpty';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserInterface } from '@/interfaces/user.interface';

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user } = res.locals as { user: UserInterface };

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        files: true,
        userInfos: true,
        articles: {
          include: { files: true },
        },
      },
    });

    if (!userData) {
      res.json({ userNotFound: true });
      return;
    }

    const { password, ...userWithoutPassword } = userData;

    res.status(200).json({
      user: { ...userWithoutPassword },
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
    return;
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { user } = res.locals;
    const body: { name?: string; bio?: string; profession?: string } = req.body;
    const infos: { name?: string; bio?: string; profession?: string } = {};

    if (body.name) infos.name = body.name;
    if (body.bio) infos.bio = body.bio;
    if (body.profession) infos.profession = body.profession;

    if (isEmpty(infos)) {
      res.json({ noChanges: true });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: infos,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({ user: { ...userWithoutPassword } });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { user } = res.locals;
    let fileName = '';

    if (req.file) {
      const extension = path.extname(req.file.originalname);
      const uniqueId = Date.now();
      fileName = `profile-${user.id}-${uniqueId}${extension}`;

      const uploadsBase = path.join(process.cwd(), 'uploads');
      const directoryPath = path.join(uploadsBase, `files/user-${user.id}`);
      const filePath = path.join(directoryPath, fileName);

      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      fs.writeFileSync(filePath, req.file.buffer);

      await prisma.file.create({
        data: {
          src: fileName,
          type: 'profile',
          userId: user.id,
        },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { files: true },
    });

    if (!updatedUser) {
      res.json({ userNotFound: true });
      return;
    }

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({ user: { ...userWithoutPassword } });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

export { updateUser, getUser, updateProfile };
