import express from 'express';

import {
  login,
  logout,
  oauthRegister,
  register,
  requireAuth,
} from '@/controllers/auth.controller';
import {
  loginValidation,
  registerValidation,
} from '@/validations/auth.validation';
import { isAuthenticated } from '@/middlewares/auth.middleware';

const router = express.Router();

router.get('/jwt', isAuthenticated, requireAuth);

router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.post('/register/:token', oauthRegister);
router.get('/logout', logout);

export default router;
