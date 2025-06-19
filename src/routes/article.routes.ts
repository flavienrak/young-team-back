import express from 'express';

import { isAuthenticated } from '@/middlewares/auth.middleware';
import { articleValidation } from '@/validations/article.validation';
import {
  createArticle,
  getArticleById,
  getAllArticles,
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
router.get('/', getAllArticles);

//get article by id
router.get('/:id', getArticleById);

export default router;
