import express from 'express';

import { upload } from '@/lib/multer';
import { updateUser } from '@/controllers/user.controller';
import { updateProfileValidation } from '@/validations/user.validation';

const router = express.Router();

router.put(
  '/update-profile',
  upload.single('file'),
  updateProfileValidation,
  updateUser,
);

export default router;
