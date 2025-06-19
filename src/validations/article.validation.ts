import { body, param } from 'express-validator';

const articleValidation = [
  body('title')
    .notEmpty()
    .withMessage('title required')
    .isLength({ min: 3 })
    .withMessage('invalid title'),

  body('sections')
    .isArray({ min: 1 })
    .withMessage('sections must be a non-empty array'),

  body('sections.*.content')
    .notEmpty()
    .withMessage('section content required')
    .isLength({ min: 6 })
    .withMessage('invalid section content'),
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

  body('sections')
    .isArray({ min: 1 })
    .withMessage('sections must be a non-empty array'),

  body('sections.*.content')
    .notEmpty()
    .withMessage('section content required')
    .isLength({ min: 6 })
    .withMessage('invalid section content'),
];

export { articleValidation, updateValidation };
