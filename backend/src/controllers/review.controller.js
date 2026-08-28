const prisma = require('../utils/prisma');

// POST /api/products/:productId/reviews
// body: { rating (1-5), title, comment }
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating (1-5) and comment are required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user has purchased this product
    const previousPurchase = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = Boolean(previousPurchase);

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating: Number(rating),
        title: title || null,
        comment: comment.trim(),
        isVerifiedPurchase,
      },
      include: {
        user: {
          select: { name: true, avatar: true },
        },
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:productId/reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : 0;

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
    });

    res.json({
      reviews,
      summary: {
        totalReviews,
        averageRating: Number(averageRating),
        ratingCounts,
      },
    });
  } catch (err) {
    next(err);
  }
};
