import passport from 'passport';

import { Request, Response } from 'express';

import '@/controllers/passport.controller';

import { app, logger, server } from '@/socket';

import authRoutes from '@/routes/auth.routes';
import tokenRoutes from './routes/token.routes';
import articleRoutes from './routes/article.routes';
import passportRoutes from './routes/passport.routes';
import userRoutes from './routes/user.routes';
import { isAuthenticated } from './middlewares/auth.middleware';

app.use(passport.initialize());

app.get('/', (req: Request, res: Response) => {
  res.send('Backend running successfully!');
});

app.use('/api/google', passportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/user', isAuthenticated, userRoutes);
app.use('/api/article', articleRoutes);

const port = process.env.BACKEND_PORT;
if (!port) {
  logger.error('ENV NOT FOUND');
} else {
  server.listen(port, () => logger.info(`App runing at: ${port}`));
}
