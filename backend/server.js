import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { registerRedesignRoutes } from './routes/redesign.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authenticateRequest } from './middleware/authentication.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIST = path.resolve(__dirname, '../frontend');

if (!process.env.STABILITY_API_KEY) {
  console.warn('[startup] STABILITY_API_KEY is not set. Image generation will fail until configured.');
}

app.disable('x-powered-by');
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        fontSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 20),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));

const authMode = (process.env.AUTH_MODE || 'none').toLowerCase();
if (authMode === 'jwt') {
  console.log('[startup] JWT authentication enabled.');
  app.use(authenticateRequest);
} else {
  console.log('[startup] Authentication disabled. Set AUTH_MODE=jwt to require tokens.');
}

registerRedesignRoutes(app);

app.use(express.static(FRONTEND_DIST));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  }
  return next();
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 DreamSpace backend listening on port ${PORT}`);
});
