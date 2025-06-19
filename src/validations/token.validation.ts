import { body, param } from 'express-validator';

const codeValidation = [
  param('token').notEmpty().withMessage('token required'),

  body('code')
    .notEmpty()
    .withMessage('code required')
    .isInt()
    .withMessage('invalid code'),
];

const tokenValidation = [
  param('token').notEmpty().withMessage('token required'),
];

export { codeValidation, tokenValidation };
