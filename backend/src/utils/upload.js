const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const { uploadToCloudinary, isCloudinaryConfigured } = require('./cloudinary');

/**
 * Saves a base64 encoded image string.
 * - If Cloudinary is configured → uploads to Cloudinary and returns the CDN URL
 * - Otherwise → saves to local disk and returns a relative /uploads/ path
 *
 * @param {string} base64Str - The data URI string (e.g. data:image/jpeg;base64,...)
 * @param {string} subfolder - Subfolder / Cloudinary folder (e.g. 'products', 'collections')
 * @returns {Promise<string>|string} - Image URL (Cloudinary CDN or local /uploads/ path)
 */
async function saveBase64Image(base64Str, subfolder = 'general') {
  if (!base64Str) return null;

  // If it's already a URL, return as-is
  if (
    base64Str.startsWith('http://') ||
    base64Str.startsWith('https://') ||
    base64Str.startsWith('/uploads/')
  ) {
    return base64Str;
  }

  // Upload to Cloudinary if configured
  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(base64Str, `anwar-clothing/${subfolder}`);
      return result.url;
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local disk:', err.message);
      // Fall through to local save
    }
  }

  // Local disk fallback
  try {
    const matches = base64Str.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }

    const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', subfolder);
    fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${nanoid()}.${extension}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    return `/uploads/${subfolder}/${filename}`;
  } catch (err) {
    console.warn('Local disk image write fallback to base64 data URI:', err.message);
    return base64Str;
  }
}

/**
 * Upload a file buffer (from multer) to Cloudinary or local disk.
 * @param {Buffer} buffer - File buffer
 * @param {string} originalname - Original filename for extension
 * @param {string} subfolder - Cloudinary folder or local subfolder
 * @returns {Promise<string>} - Image URL
 */
async function saveFileBuffer(buffer, originalname, subfolder = 'general') {
  // Upload to Cloudinary if configured
  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(buffer, `anwar-clothing/${subfolder}`);
      return result.url;
    } catch (err) {
      console.error('Cloudinary upload failed, falling back to local disk:', err.message);
    }
  }

  // Local disk fallback
  const ext = path.extname(originalname) || '.jpg';
  const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', subfolder);
  fs.mkdirSync(uploadDir, { recursive: true });

  const filename = `${nanoid()}${ext}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${subfolder}/${filename}`;
}

module.exports = {
  saveBase64Image,
  saveFileBuffer,
};
