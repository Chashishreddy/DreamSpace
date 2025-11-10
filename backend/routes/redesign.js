import express from 'express';
import { redesignRoom } from '../controllers/redesignController.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/api/redesign', uploadMiddleware, redesignRoom);

export function registerRedesignRoutes(app) {
  app.use(router);
}
