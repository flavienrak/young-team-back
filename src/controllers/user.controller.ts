import fs from 'fs';
import path from 'path';
import prisma from '@/lib/db';
import isEmpty from '@/utils/isEmpty';

import { Request, Response } from 'express';
import { imageMimeTypes } from '@/utils/constants';
import { validationResult } from 'express-validator';

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
    let fileName = '';

    if (body.name) infos.name = body.name;
    if (body.bio) infos.bio = body.bio;
    if (body.profession) infos.profession = body.profession;

    if (req.file && imageMimeTypes.includes(req.file.mimetype)) {
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

    if (isEmpty(infos)) {
      res.json({ noChanges: true });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: infos,
    });

    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({ user: { ...userWithoutPassword, image: fileName } });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

export { updateUser };
