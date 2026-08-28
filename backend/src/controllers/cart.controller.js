const prisma = require('../utils/prisma');

async function calculateSubtotal(cartId) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: true, variant: true },
  });

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = Number(item.product.basePrice) + Number(item.variant?.priceDelta || 0);
    return sum + unitPrice * item.quantity;
  }, 0);

  return { items, subtotal };
}

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    const { items, subtotal } = await calculateSubtotal(cart.id);
    res.json({ cart: { id: cart.id, items, subtotal } });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/items  { productId, variantId?, quantity, note? }
exports.addItem = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1, note } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    if (quantity < 1) return res.status(400).json({ error: 'quantity must be at least 1' });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found' });

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (!variant || variant.productId !== productId) {
        return res.status(400).json({ error: 'Variant does not belong to this product' });
      }
      if (variant.stock < quantity) {
        return res.status(409).json({ error: `Only ${variant.stock} left in stock for this variant` });
      }
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

    // Find existing cart item matching product + variant (handle null variantId safely)
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    let item;
    if (existingItem) {
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity }, note },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId || null, quantity, note },
      });
    }

    const { items, subtotal } = await calculateSubtotal(cart.id);
    res.status(201).json({ cart: { id: cart.id, items, subtotal }, addedItem: item });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/cart/items/:itemId  { quantity }
exports.updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be at least 1' });

    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    const { items, subtotal } = await calculateSubtotal(item.cartId);
    res.json({ cart: { id: item.cartId, items, subtotal } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/items/:itemId
exports.removeItem = async (req, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    const { items, subtotal } = await calculateSubtotal(item.cartId);
    res.json({ cart: { id: item.cartId, items, subtotal } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart — empty the whole cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ cart: { id: cart?.id, items: [], subtotal: 0 } });
  } catch (err) {
    next(err);
  }
};
