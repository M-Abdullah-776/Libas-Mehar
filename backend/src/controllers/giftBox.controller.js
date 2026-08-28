const prisma = require('../utils/prisma');

const VALID_CATEGORIES = ['fabric', 'fragrance', 'leather'];

// POST /api/gift-box — start composing ("Begin Composing")
exports.createDraft = async (req, res, next) => {
  try {
    const giftBox = await prisma.giftBox.create({
      data: { userId: req.user.id, totalPrice: 0, status: 'DRAFT' },
    });
    res.status(201).json({ giftBox });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/gift-box/:id/items
// body: { items: [{ productId, variantId?, category: "fabric"|"fragrance"|"leather" }] }
// Replaces the full set of picks each time — simplest mental model for a "composer" UI
exports.setItems = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    for (const item of items) {
      if (!VALID_CATEGORIES.includes(item.category)) {
        return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
    }

    const giftBox = await prisma.giftBox.findUnique({ where: { id: req.params.id } });
    if (!giftBox || giftBox.userId !== req.user.id) {
      return res.status(404).json({ error: 'Gift box not found' });
    }
    if (giftBox.status !== 'DRAFT') {
      return res.status(409).json({ error: 'This gift box has already been finalized' });
    }

    // Validate every product exists and fetch prices in one pass
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      if (!productMap.has(item.productId)) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
    }

    const totalPrice = items.reduce((sum, item) => sum + Number(productMap.get(item.productId).basePrice), 0);

    await prisma.$transaction([
      prisma.giftBoxItem.deleteMany({ where: { giftBoxId: giftBox.id } }),
      prisma.giftBoxItem.createMany({
        data: items.map((i) => ({
          giftBoxId: giftBox.id,
          productId: i.productId,
          variantId: i.variantId || null,
          category: i.category,
        })),
      }),
      prisma.giftBox.update({ where: { id: giftBox.id }, data: { totalPrice } }),
    ]);

    const updated = await prisma.giftBox.findUnique({
      where: { id: giftBox.id },
      include: { components: true },
    });

    res.json({ giftBox: updated });
  } catch (err) {
    next(err);
  }
};

// POST /api/gift-box/:id/add-to-cart
// Pushes the composed box into the user's cart as line items, then locks the box
exports.addToCart = async (req, res, next) => {
  try {
    const giftBox = await prisma.giftBox.findUnique({
      where: { id: req.params.id },
      include: { components: true },
    });
    if (!giftBox || giftBox.userId !== req.user.id) {
      return res.status(404).json({ error: 'Gift box not found' });
    }
    if (giftBox.components.length < VALID_CATEGORIES.length) {
      return res.status(400).json({ error: 'A gift box needs one item from each category (fabric, fragrance, leather)' });
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    await prisma.$transaction([
      ...giftBox.components.map((c) =>
        prisma.cartItem.upsert({
          where: {
            cartId_productId_variantId: {
              cartId: cart.id,
              productId: c.productId,
              variantId: c.variantId || null,
            },
          },
          update: { quantity: { increment: 1 } },
          create: { cartId: cart.id, productId: c.productId, variantId: c.variantId, quantity: 1 },
        })
      ),
      prisma.giftBox.update({ where: { id: giftBox.id }, data: { status: 'ADDED_TO_CART' } }),
    ]);

    res.json({ message: 'Gift box added to cart', cartId: cart.id });
  } catch (err) {
    next(err);
  }
};
