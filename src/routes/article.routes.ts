import express from 'express';

import { isAuthenticated } from '@/middlewares/auth.middleware';
import {
  articleValidation,
  updateValidation,
} from '@/validations/article.validation';
import {
  createArticle,
  // deleteArticle,
  // getAllArticles,
  // getArticleById,
  // updateArticle,
} from '@/controllers/article.controller';
import { upload } from '@/lib/multer';

const router = express.Router();

//route pour crée un article
router.post(
  '/',
  upload.any(),
  isAuthenticated,
  articleValidation,
  createArticle,
);

//route pour lire tous les articles
// router.get('/', getAllArticles);

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
