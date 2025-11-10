import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type. Please upload a JPG or PNG image.'));
  }
  return cb(null, true);
};

const limits = {
  fileSize: Number(process.env.MAX_UPLOAD_BYTES || 5 * 1024 * 1024),
};

const upload = multer({ storage, fileFilter, limits }).single('image');

export function uploadMiddleware(req, res, next) {
  upload(req, res, err => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: err.message });
    }
    return next();
  });
}
