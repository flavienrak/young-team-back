import express from 'express';

import { upload } from '@/middlewares/multer.middleware';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import {
  articleValidation,
  updateValidation,
} from '@/validations/article.validation';
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  updateArticle,
} from '@/controllers/article.controller';

const router = express.Router();

//route pour crée un article
router.post(
  '/',
  isAuthenticated,
  upload.array('images', 10),
  articleValidation,
  createArticle,
);

//route pour lire tous les articles
router.get('/', getAllArticles);

//route pour modifier l'article
router.put(
  '/:id',
  isAuthenticated,
  upload.array('images', 10),
  updateValidation,
  updateArticle,
);

//route pour supprimer l'article
router.delete('/:id', isAuthenticated, deleteArticle);

export default router;
