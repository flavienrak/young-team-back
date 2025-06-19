import { body, param } from 'express-validator';

const articleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('title required')
    .isLength({ min: 3 })
    .withMessage('title too short'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('description required')
    .isLength({ min: 10 })
    .withMessage('description too short'),

  body('secteur').trim().notEmpty().withMessage('secteur required'),
];

const updateValidation = [
  param('id')
    .notEmpty()
    .withMessage('id required')
    .isInt({ gt: 0 })
    .withMessage('invalid id'),

  body('title')
    .notEmpty()
    .withMessage('title required')
    .isLength({ min: 3 })
    .withMessage('invalid title'),
];

export { articleValidation, updateValidation };
