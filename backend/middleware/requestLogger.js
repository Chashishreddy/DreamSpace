import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { format } from '../utils/time.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, '../logs');
const LOG_FILE = path.join(LOG_DIR, 'audit.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function requestLogger(req, res, next) {
  const startTime = process.hrtime.bigint();
  const { method, originalUrl, ip } = req;
  const actor = req.user?.sub || 'anonymous';
  const role = req.user?.role || 'guest';

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    const logEntry = {
      timestamp: format(new Date()),
      method,
      url: originalUrl,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip,
      actor,
      role,
      userAgent: req.headers['user-agent'],
    };

    fs.appendFile(LOG_FILE, `${JSON.stringify(logEntry)}\n`, err => {
      if (err) {
        console.error('Failed to write audit log', err);
      }
    });
  });

  next();
}
