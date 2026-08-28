const prisma = require('../utils/prisma');

// GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            collection: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ wishlist: items.map((i) => i.product) });
  } catch (err) {
    next(err);
  }
};

// POST /api/wishlist/toggle
// body: { productId }
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
      return res.json({ favorited: false, message: 'Removed from wishlist' });
    }

    await prisma.wishlistItem.create({
      data: {
        userId: req.user.id,
        productId,
      },
    });

    res.json({ favorited: true, message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
};
