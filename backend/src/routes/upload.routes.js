const router = require('express').Router();
const multer = require('multer');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { saveFileBuffer } = require('../utils/upload');

// Store files in memory (buffer) — we'll pipe them to Cloudinary or local disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false);
    }
  },
});

// POST /api/upload — single image upload (admin only)
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const folder = req.body.folder || 'products';
      const url = await saveFileBuffer(req.file.buffer, req.file.originalname, folder);

      res.json({ url });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/upload/multiple — up to 6 images (admin only)
router.post(
  '/multiple',
  authenticate,
  requireAdmin,
  upload.array('images', 6),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      const folder = req.body.folder || 'products';
      const urls = await Promise.all(
        req.files.map((file) => saveFileBuffer(file.buffer, file.originalname, folder))
      );

      res.json({ urls });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
