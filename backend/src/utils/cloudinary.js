const cloudinary = require('cloudinary').v2;

// Auto-configures from CLOUDINARY_URL env var (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
  console.log('☁️  Cloudinary configured successfully');
} else {
  console.warn('⚠️  CLOUDINARY_URL not set — image uploads will use local disk storage');
}

/**
 * Upload a buffer or base64 string to Cloudinary.
 * @param {Buffer|string} source - File buffer from multer, or a base64 data URI string
 * @param {string} folder - Cloudinary folder (e.g. 'products', 'collections')
 * @returns {Promise<{url: string, publicId: string}>}
 */
async function uploadToCloudinary(source, folder = 'anwar-clothing') {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
      ],
    };

    // If source is a Buffer (from multer), use upload_stream
    if (Buffer.isBuffer(source)) {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      });
      stream.end(source);
    }
    // If source is a base64 data URI string
    else if (typeof source === 'string' && source.startsWith('data:image')) {
      cloudinary.uploader.upload(source, options, (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      });
    }
    // If it's already a URL, just return it
    else if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
      resolve({ url: source, publicId: null });
    }
    else {
      reject(new Error('Invalid image source: must be a Buffer, base64 data URI, or URL'));
    }
  });
}

/**
 * Delete an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
  }
}

/**
 * Check if Cloudinary is configured and ready.
 */
function isCloudinaryConfigured() {
  return !!process.env.CLOUDINARY_URL;
}

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
};
