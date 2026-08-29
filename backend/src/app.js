const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const addressRoutes = require('./routes/address.routes');
const disciplineRoutes = require('./routes/discipline.routes');
const collectionRoutes = require('./routes/collection.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const giftBoxRoutes = require('./routes/giftBox.routes');
const orderRoutes = require('./routes/order.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const adminRoutes = require('./routes/admin.routes');
const reviewRoutes = require('./routes/review.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const { router: settingsRoutes } = require('./routes/settings.routes');
const chatRoutes = require('./routes/chat.routes');
const uploadRoutes = require('./routes/upload.routes');

const errorHandler = require('./middleware/errorHandler');

const path = require('path');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "https://images.unsplash.com", "*"],
      },
    },
  })
);
const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? origin.replace(/\/$/, '') : null;
      if (
        !origin ||
        process.env.NODE_ENV !== 'production' ||
        clientUrls.length === 0 ||
        clientUrls.includes(normalizedOrigin) ||
        clientUrls.includes('*')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/disciplines', disciplineRoutes);   // Fabric / Leather / Fragrance / Gift Box
app.use('/api/collections', collectionRoutes);   // Egyptian Giza, Blue Mint, etc.
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/gift-box', giftBoxRoutes);         // "Compose a Box" feature
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);              // Admin-only routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
