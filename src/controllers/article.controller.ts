import path from 'path';
import prisma from '@/lib/db';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, description, secteur } = req.body;
    const sections = JSON.parse(req.body.sections);
    const userId = Number(res.locals.userId);
    const files = req.files as Express.Multer.File[];

    if (!userId || isNaN(userId)) {
      res.json({ invalidId: true });
      return;
    }

    if (!files || files.length === 0) {
      res.json({ imageRequired: true });
      return;
    }

    const backgroundImage = `uploads/${files[0].filename}`;

    const partage = await prisma.partage.create({
      data: {
        title,
        description,
        secteur,
        backgroundImage,
        fileId: 0,
        userId,
      },
    });

    const Sections = [];

    for (let i = 0; i < sections.length; i++) {
      const section = await prisma.section.create({
        data: {
          content: sections[i].content,
          userId,
          partageId: partage.id,
        },
      });

      let image = null;
      if (files[i + 1]) {
        image = `uploads/${files[i + 1].filename}`;
        await prisma.file.create({
          data: {
            src: image,
            userId,
            sectionId: section.id,
          },
        });
      }

      Sections.push({ content: section.content, image });
    }

    res.status(201).json({
      article: {
        id: partage.id,
        title,
        description,
        secteur,
        backgroundImage,
        userId,
        sections: Sections,
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

const getAllArticles = async (req: Request, res: Response) => {
  try {
    const articlesRaw = await prisma.partage.findMany({
      include: {
        sections: {
          include: {
            files: true,
          },
        },
      },
    });

    const articles = articlesRaw.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.description,
      categorie: article.secteur,
      backgroundImage: article.backgroundImage,
      userId: article.userId,
      sections: article.sections.map((section) => ({
        content: section.content,
        image: section.files[0]?.src || null,
      })),
    }));
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

const getArticleById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.json({ inalidId: true });
      return;
    }

    const existingArticle = await prisma.partage.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            files: true,
          },
        },
      },
    });

    if (!existingArticle) {
      res.json({ articleNotFound: true });
      return;
    }

    const article = {
      id: existingArticle.id,
      title: existingArticle.title,
      description: existingArticle.description,
      categorie: existingArticle.secteur,
      backgroundImage: existingArticle.backgroundImage,
      userId: existingArticle.userId,
      sections: existingArticle.sections.map((section) => ({
        content: section.content,
        image: section.files[0]?.src || null,
      })),
    };

    res.status(200).json({ article });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ unknownError: error });
    return;
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

    if (existingArticle.userId !== user) {
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
