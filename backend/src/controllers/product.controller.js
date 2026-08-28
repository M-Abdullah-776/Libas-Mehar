const prisma = require('../utils/prisma');

// GET /api/products/:slug — full product detail page
exports.getBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        stitchOptions: true,
        collection: { include: { discipline: true } },
      },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/bestsellers — powers "Quietly, the Favourites" section
exports.getBestsellers = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);
    const products = await prisma.product.findMany({
      where: { isBestseller: true, isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        collection: { select: { name: true, slug: true } },
      },
      take: limit,
    });
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/search?q=cotton
exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ products: [] });

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        images: { take: 1 },
        collection: { select: { name: true, slug: true } }
      },
      take: 20,
    });

    res.json({ products });
  } catch (err) {
    next(err);
  }
};
