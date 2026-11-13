import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { loadUser } from './middlewares/auth.middleware.js';
import { UPLOAD_DIR } from './middlewares/upload.middleware.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(loadUser);

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
