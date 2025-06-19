import { body, param } from 'express-validator';

const articleValidation = [
  body('title')
    .notEmpty()
    .withMessage('title required')
    .isLength({ min: 3 })
    .withMessage('title too short'),

  body('description')
    .notEmpty()
    .withMessage('description required')
    .isLength({ min: 10 })
    .withMessage('description too short'),

  body('secteur ').notEmpty().withMessage('categorie required'),

  body('sections').custom((value, { req }) => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('sections must be a non-empty array');
      }
      for (const section of parsed) {
        if (!section.content || section.content.length < 6) {
          throw new Error(
            'each section must have content of at least 6 characters',
          );
        }
      }
      return true;
    } catch (err: any) {
      throw new Error('Invalid sections format');
    }
  }),
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
