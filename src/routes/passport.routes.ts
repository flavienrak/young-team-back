import passport from 'passport';

import { Router, Request, Response } from 'express';
import { maxAgeAuthToken } from '@/utils/constants';

const tokenName = process.env.AUTH_TOKEN_NAME as string;
const frontendUri = process.env.FRONTEND_URI as string;

const router = Router();

router.get(
  '/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/callback',
  passport.authenticate('google', { session: false }),
  (req: Request, res: Response) => {
    const userData = req.user as any;
    const { token, userNotFound } = userData;

    if (userNotFound) {
      res.redirect(`${frontendUri}/auth/${token}`);
    } else {
      res.cookie(tokenName, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: maxAgeAuthToken,
      });

      res.redirect(`${frontendUri}/home`);
    }
  },
);

export default router;
