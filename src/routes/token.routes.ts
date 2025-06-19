import express from 'express';

import {
  codeValidation,
  tokenValidation,
} from '@/validations/token.validation';
import { oAuth, verifyCode, verifyToken } from '@/controllers/token.controller';

const router = express.Router();

//route pour verifier le token sent via mail
router.get('/:token', tokenValidation, verifyToken);

//route pour verifier le code de verification
router.post('/:token/code', codeValidation, verifyCode);

//verification token with google Oauth
router.get('/:token/oauth', tokenValidation, oAuth);

export default router;
