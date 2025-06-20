import { body } from 'express-validator';
import { imageMimeTypes } from '@/utils/constants';

const updateUserValidation = [
  body('name').trim().notEmpty().withMessage('name required'),
];

const updateProfileValidation = [
  body().custom((value, { req }) => {
    if (!req.file) {
      return false;
    } else if (!imageMimeTypes.includes(req.file.mimetype)) {
      return false;
    }

    return true;
  }),
];

export { updateUserValidation, updateProfileValidation };
