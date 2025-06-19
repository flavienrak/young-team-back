import express from 'express';

import {
  codeValidation,
  tokenValidation,
} from '@/validations/token.validation';
import { oAuth, verifyCode, verifyToken } from '@/controllers/token.controller';

const router = express.Router();

//route pour verifier le token envoyé via mail
router.get('/:token', tokenValidation, verifyToken);

//route pour verifier le code de verification
router.post('/:token/code', codeValidation, verifyCode);

//route pour verifier le token lorsqu'on se connecte avec google
router.get('/:token/oauth', tokenValidation, oAuth);

export default router;
