import path from 'path';
import prisma from '@/lib/db';

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, description, secteur } = req.body;
    console.log(' title:', title);
    console.log(' description:', description);
    console.log(' secteur:', secteur);

    const sections = JSON.parse(req.body.sections);
    console.log(' sections:', sections);

    const userId = Number(res.locals.userId);
    console.log(' userId:', res.locals.userId);

    const files = req.files as Express.Multer.File[];

    if (!userId || isNaN(userId)) {
      res.json({ invalidId: true });
      return;
    }

    if (!files || files.length === 0) {
      res.json({ imageRequired: true });
      return;
    }

    const bgImage = req.body.bgImage;
    console.log(' bgImage:', bgImage);

    const file = await prisma.file.create({
      data: {
        src: bgImage,
        userId,
      },
    });

    const partage = await prisma.partage.create({
      data: {
        title,
        description,
        secteur,
        userId,
      },
    });
    console.log(' partage créé avec ID:', partage.id);

    for (let i = 0; i < sections.length; i++) {
      const section = await prisma.section.create({
        data: {
          content: sections[i].content,
          userId,
          partageId: partage.id,
        },
      });
      console.log(`section ${i + 1} créée avec ID:`, section.id);

      let image = null;
      if (files[i + 1]) {
        image = req.body.image;
        console.log(` image pour section ${i + 1}:`, image);

        await prisma.file.create({
          data: {
            src: image,
            userId,
            sectionId: section.id,
          },
        });
      }
    }

    res.status(201).json({
      article: {
        id: partage.id,
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
const getArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await prisma.partage.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        description: true,
        secteur: true,
        userId: true,

        files: {
          select: {
            src: true,
          },
        },

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
      return res.json({ articleNotFound: true });
    }

    const response = {
      id: article.id,
    };

    res.status(200).json({ response });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ unknownError: error });
    }
  }
};

// const updateArticle = async (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     res.status(400).json({ errors: errors.array() });
//     return;
//   }

//   const { id } = req.params;
//   const { title, sections } = req.body;
//   const { userId } = res.locals;
//   const user = Number(userId);

//   if (!userId || isNaN(user)) {
//     res.json({ invalidId: true });
//     return;
//   }

//   try {
//     const existingArticle = await prisma.partage.findUnique({
//       where: { id: Number(id) },
//       select: { userId: true },
//     });

//     if (!existingArticle) {
//       res.json({ ArtcileNotFound: true });
//       return;
//     }

//     if (existingArticle.userId !== user) {
//       res.json({ unAuthorized: true });
//       return;
//     }

//     await prisma.partage.update({
//       where: { id: Number(id) },
//       data: { title },
//     });

//     if (Array.isArray(sections)) {
//       for (const section of sections) {
//         await prisma.section.updateMany({
//           where: {
//             id: Number(section.id),
//             partageId: Number(id),
//             userId: user,
//           },
//           data: { content: section.content },
//         });
//       }
//     }

//     const uploadedFiles = req.files as Express.Multer.File[];
//     if (uploadedFiles && uploadedFiles.length > 0 && Array.isArray(sections)) {
//       const filesToCreate = uploadedFiles.map((file, i) => ({
//         src: path.join('uploads', file.filename),
//         userId: user,
//         sectionId: Number(sections[i]?.id),
//       }));

//       await prisma.file.createMany({ data: filesToCreate });
//     }

//     const updatedArticle = await prisma.partage.findUnique({
//       where: { id: Number(id) },
//       select: {
//         title: true,
//         sections: {
//           select: {
//             id: true,
//             content: true,
//             files: {
//               select: {
//                 src: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     res.status(200).json({ article: updatedArticle });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ unknownError: error });
//     }
//   }
// };

// const deleteArticle = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { userId } = res.locals;
//   const user = Number(userId);

//   if (!userId || isNaN(user)) {
//     res.json({ invalidId: true });
//     return;
//   }

//   try {
//     const article = await prisma.partage.findUnique({
//       where: { id: Number(id) },
//       select: { userId: true },
//     });

//     if (!article) {
//       res.json({ articleNotFound: true });
//       return;
//     }

//     if (article.userId !== user) {
//       res.json({ unAuthorized: true });
//       return;
//     }

//     const deleteArticle = await prisma.partage.delete({
//       where: { id: Number(id) },
//     });

//     res.status(200).json({ deleteArticle });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message });
//     } else {
//       res.status(500).json({ unknownError: error });
//     }
//   }
// };

export {
  createArticle,
  // getArticles,
  // getArticleById,
  // updateArticle,
  // deleteArticle,
};
