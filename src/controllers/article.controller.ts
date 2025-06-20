import path from 'path';
import prisma from '@/lib/db';
import crypto from 'crypto';
import fs from 'fs';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserInterface } from '@/interfaces/user.interface';

const uniqueId = crypto.randomBytes(4).toString('hex');

const createArticle = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { user } = res.locals as { user: UserInterface };
    const body = req.body as {
      title: string;
      description: string;
      secteur: string;
      sections: { content: string }[];
    };

    let bgImage: any = null;

    const sections = body.sections.map((section, index) => {
      if (req.files && Array.isArray(req.files)) {
        const file = req.files.find(
          (f) => f.fieldname === `sections[${index}][file]`,
        );
        return {
          content: section.content,
          file,
        };
      }
    });

    if (req.files && Array.isArray(req.files)) {
      bgImage = req.files.find((f) => f.fieldname === 'bgImage');
    }

    if (!bgImage) {
      res.json({ bgRequired: true });
      return;
    } else if (sections.length === 0) {
      res.json({ sectionsRequired: true });
      return;
    }

    const article = await prisma.article.create({
      data: {
        title: body.title,
        description: body.description,
        secteur: body.secteur,
        userId: user.id,
      },
    });

    const extension = path.extname(bgImage.originalname);
    const fileName = `profile-${user.id}-${Date.now()}-${uniqueId}${extension}`;
    const uploadsBase = path.join(process.cwd(), 'uploads');
    const directoryPath = path.join(uploadsBase, `/files/user-${user.id}`);
    const filePath = path.join(directoryPath, fileName);

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    fs.writeFileSync(filePath, bgImage.buffer);

    await prisma.file.create({
      data: {
        src: fileName,
        userId: user.id,
        articleId: article.id,
        type: 'article',
      },
    });

    for (const item of sections) {
      if (item) {
        const section = await prisma.section.create({
          data: {
            content: item.content,
            userId: user.id,
            articleId: article.id,
          },
        });

        if (item.file && section) {
          const extension = path.extname(item.file.originalname);
          const fileName = `profile-${user.id}-${Date.now()}-${uniqueId}${extension}`;
          const uploadsBase = path.join(process.cwd(), 'uploads');
          const directoryPath = path.join(
            uploadsBase,
            `/files/user-${user.id}`,
          );
          const filePath = path.join(directoryPath, fileName);

          if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
          }
          fs.writeFileSync(filePath, bgImage.buffer);

          await prisma.file.create({
            data: {
              src: fileName,
              userId: user.id,
              sectionId: section.id,
              type: 'section',
            },
          });
        }
      }
    }

    res.status(201).json({
      article: {
        id: article.id,
      },
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profession: true,
            bio: true,
            files: true,
          },
        },
        files: true,
        sections: {
          include: {
            files: true,
          },
        },
      },
    });

    if (!article) {
      res.json({ articleNotFound: true });
      return;
    }

    const articles = await prisma.article.findMany({
      where: { secteur: article.secteur },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profession: true,
            bio: true,
            files: true,
          },
        },
        files: true,
        sections: {
          include: {
            files: true,
          },
        },
      },
    });

    res.status(200).json({ article, articles });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        secteur: true,
        userId: true,
        files: {
          select: { src: true },
        },
        sections: {
          select: {
            id: true,
            content: true,
            files: {
              select: { src: true },
            },
          },
        },
      },
    });

    res.status(200).json({ articles });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

export { createArticle, getArticleById, getAllArticles };
