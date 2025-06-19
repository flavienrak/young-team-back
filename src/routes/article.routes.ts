import express from 'express';

import { upload } from '@/middlewares/multer.middleware';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import {
  articleValidation,
  updateValidation,
} from '@/validations/article.validation';
import {
  createArticle,
  // deleteArticle,
  // getArticles,
  // getArticleById,
  // updateArticle,
} from '@/controllers/article.controller';

const router = express.Router();

//route pour crée un article
router.post(
  '/',
  isAuthenticated,
  upload.any(),
  articleValidation,
  createArticle,
);

//route pour lire tous les articles
// router.get('/', getArticles);

//get article by id
// router.get('/:id', getArticleById);

//route pour modifier l'article
// router.put(
//   '/:id',
//   isAuthenticated,
//   upload.any(),
//   updateValidation,
//   updateArticle,
// );

//route pour supprimer l'article
// router.delete('/:id', isAuthenticated, deleteArticle);

export default router;
