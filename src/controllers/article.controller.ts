import path from 'path';
import prisma from '@/lib/db';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const createArticle = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { title, sections } = req.body;
  const { userId } = res.locals;
  const id = Number(userId);

  if (!userId || isNaN(id)) {
    res.json({ invalidId: true });
    return;
  }

  try {
    const partage = await prisma.partage.create({
      data: {
        title,
        userId: id,
        fileId: 0,
      },
    });

    let createdSections = [];
    if (Array.isArray(sections) && sections.length > 0) {
      createdSections = [];
      for (const sec of sections) {
        const createdSection = await prisma.section.create({
          data: {
            content: sec.content,
            userId: id,
            partageId: partage.id,
          },
        });
        createdSections.push(createdSection);
      }
    } else {
      res.json({ error: 'At least  create one section' });
      return;
    }

    const uploadedFiles = req.files as Express.Multer.File[];
    if (uploadedFiles && uploadedFiles.length > 0) {
      const filesToCreate = uploadedFiles.map((file, i) => ({
        src: path.join('uploads', file.filename),
        userId: id,
        sectionId: createdSections[i % createdSections.length].id,
      }));

      await prisma.file.createMany({ data: filesToCreate });
    }

    const createdArticle = await prisma.partage.findUnique({
      where: { id: partage.id },
      select: {
        title: true,
        sections: {
          select: {
            content: true,
            files: {
              select: {
                src: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({ article: createdArticle });
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
    const articles = await prisma.partage.findMany({
      select: {
        id: true,
        title: true,
        sections: {
          select: {
            content: true,
            files: {
              select: {
                src: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ articles });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const getArticleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const article = await prisma.partage.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        sections: {
          select: {
            id: true,
            content: true,
            files: {
              select: {
                src: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      res.json({ articleNotFound: true });
      return;
    }

    res.json({ article });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const updateArticle = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { id } = req.params;
  const { title, sections } = req.body;
  const { userId } = res.locals;
  const user = Number(userId);

  if (!userId || isNaN(user)) {
    res.json({ invalidId: true });
    return;
  }

  try {
    const existingArticle = await prisma.partage.findUnique({
      where: { id: Number(id) },
      select: { userId: true },
    });

    if (!existingArticle) {
      res.json({ ArtcileNotFound: true });
      return;
    }

    if (existingArticle.userId !== Number(userId)) {
      res.json({ unAuthorized: true });
      return;
    }

    await prisma.partage.update({
      where: { id: Number(id) },
      data: { title },
    });

    if (Array.isArray(sections)) {
      for (const section of sections) {
        await prisma.section.updateMany({
          where: {
            id: Number(section.id),
            partageId: Number(id),
            userId: user,
          },
          data: { content: section.content },
        });
      }
    }

    const uploadedFiles = req.files as Express.Multer.File[];
    if (uploadedFiles && uploadedFiles.length > 0 && Array.isArray(sections)) {
      const filesToCreate = uploadedFiles.map((file, i) => ({
        src: path.join('uploads', file.filename),
        userId: user,
        sectionId: Number(sections[i]?.id),
      }));

      await prisma.file.createMany({ data: filesToCreate });
    }

    const updatedArticle = await prisma.partage.findUnique({
      where: { id: Number(id) },
      select: {
        title: true,
        sections: {
          select: {
            id: true,
            content: true,
            files: {
              select: {
                src: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({ article: updatedArticle });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

const deleteArticle = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = res.locals;
  const user = Number(userId);

  if (!userId || isNaN(user)) {
    res.json({ invalidId: true });
    return;
  }

  try {
    const article = await prisma.partage.findUnique({
      where: { id: Number(id) },
      select: { userId: true },
    });

    if (!article) {
      res.json({ articleNotFound: true });
      return;
    }

    if (article.userId !== user) {
      res.json({ unAuthorized: true });
      return;
    }

    const deleteArticle = await prisma.partage.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ deleteArticle });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

export {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
