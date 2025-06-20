import express from 'express';

import { upload } from '@/lib/multer';
import {
  getUser,
  updateProfile,
  updateUser,
} from '@/controllers/user.controller';
import {
  updateProfileValidation,
  updateUserValidation,
} from '@/validations/user.validation';

const router = express.Router();

router.get('/', getUser);

router.put('/', updateUserValidation, updateUser);

router.put(
  '/profile',
  upload.single('file'),
  updateProfileValidation,
  updateProfile,
);

export default router;
