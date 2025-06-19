import { body, param } from 'express-validator';

const articleValidation = [
  body('title')
    .notEmpty()
    .withMessage('title required')
    .isLength({ min: 3 })
    .withMessage('invalid title'),

  body('content')
    .notEmpty()
    .withMessage('content required')
    .isLength({ min: 6 })
    .withMessage('invalid content'),
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

  body('content')
    .notEmpty()
    .withMessage('content required')
    .isLength({ min: 6 })
    .withMessage('invalid content'),
];
export { articleValidation, updateValidation };
