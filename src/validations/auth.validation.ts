import { body, param } from 'express-validator';

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('invalid email'),
  body('password')
    .notEmpty()
    .withMessage('password required')
    .isLength({ min: 6 })
    .withMessage('invalid password'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('type required')
    .isIn(['person', 'organization'])
    .withMessage('invalid type'),
];

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name required')
    .isLength({ min: 3 })
    .withMessage('invalid name'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('invalid email'),
  body('password')
    .notEmpty()
    .withMessage('password required')
    .isLength({ min: 6 })
    .withMessage('invalid password'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('type required')
    .isIn(['person', 'organization'])
    .withMessage('invalid type'),
  body('secteur')
    .if(body('type').equals('organization'))
    .notEmpty()
    .withMessage('secteur required ')
    .isLength({ min: 2 })
    .withMessage('invalid secteur'),
];

const oauthValidation = [
  param('token').notEmpty().withMessage('token required'),
  body('password')
    .notEmpty()
    .withMessage('password required')
    .isLength({ min: 6 })
    .withMessage('invalid password'),
];
export { loginValidation, registerValidation, oauthValidation };
