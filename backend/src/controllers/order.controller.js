const prisma = require('../utils/prisma');
const { nanoid } = require('nanoid');
const { readSettings } = require('../routes/settings.routes');

// POST /api/orders/checkout
// body: { addressId, paymentMethod: "COD"|"CARD"|"JAZZCASH"|"EASYPAISA" }
exports.checkout = async (req, res, next) => {
  try {
    const { addressId, paymentMethod, couponCode } = req.body;
    if (!addressId || !paymentMethod) {
      return res.status(400).json({ error: 'addressId and paymentMethod are required' });
    }

    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Re-check stock right before committing — prevents overselling between
    // "add to cart" and "checkout" if stock changed in the meantime
    for (const item of cart.items) {
      if (item.variant && item.variant.stock < item.quantity) {
        return res.status(409).json({
          error: `"${item.product.name}" only has ${item.variant.stock} left in the selected variant`,
        });
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const unitPrice = Number(item.product.basePrice) + Number(item.variant?.priceDelta || 0);
      return sum + unitPrice * item.quantity;
    }, 0);

    const settings = readSettings();
    
    // Apply coupon discount if code matches
    let discount = 0;
    if (couponCode) {
      const coupon = (settings.coupons || []).find(
        (c) => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.isActive
      );
      if (coupon) {
        if (coupon.type === 'PERCENT') {
          discount = Math.round((subtotal * Number(coupon.value)) / 100);
        } else if (coupon.type === 'FIXED') {
          discount = Number(coupon.value);
        }
        discount = Math.min(discount, subtotal);
      }
    }

    const shippingCost = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCost;
    const total = Math.max(0, subtotal - discount + shippingCost);

    const isOnlinePayment = ['CARD', 'JAZZCASH', 'EASYPAISA'].includes(paymentMethod);
    const paymentStatus = isOnlinePayment ? 'PAID' : 'PENDING';
    const transactionId = isOnlinePayment ? `TRX-${nanoid(10).toUpperCase()}` : null;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `AC-${nanoid(8).toUpperCase()}`,
          userId: req.user.id,
          subtotal,
          shippingCost,
          discount,
          total,
          paymentMethod,
          paymentStatus,
          shippingAddress: JSON.stringify({
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            province: address.province,
            postalCode: address.postalCode,
            transactionId,
          }),
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtPurchase: Number(item.product.basePrice) + Number(item.variant?.priceDelta || 0),
            })),
          },
        },
        include: { items: true },
      });

      // decrement stock for items that have variants
      for (const item of cart.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    // Fetch complete order with item products and user info for the email notifications
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { product: true } },
          user: true,
        },
      });
      const mailer = require('../utils/mailer');
      mailer.sendCustomerOrderConfirmation(fullOrder).catch(err => console.error('Error sending customer order confirmation email:', err));
      mailer.sendAdminNewOrderAlert(fullOrder).catch(err => console.error('Error sending admin order alert email:', err));
    } catch (err) {
      console.error('Failed to trigger order confirmation emails:', err);
    }

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — the logged-in user's own order history
exports.listMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: { select: { name: true, slug: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!order || (order.userId !== req.user.id && req.user.role !== 'ADMIN')) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status — admin only, e.g. moving PLACED -> SHIPPED -> DELIVERED
exports.updateStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: { user: true, items: { include: { product: true } } },
    });

    // Send email notification on key status changes
    if (orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED') {
      try {
        const mailer = require('../utils/mailer');
        mailer.sendOrderStatusEmail(order, orderStatus).catch(err =>
          console.error('Order status email error:', err)
        );
      } catch (err) {
        console.error('Failed to send order status email:', err);
      }
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/track (Public Guest / Customer tracking by orderNumber & phone)
exports.trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber || !phone) {
      return res.status(400).json({ error: 'orderNumber and phone are required for tracking' });
    }

    const cleanOrderNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim();

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: cleanOrderNum,
      },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: { take: 1 } } },
            variant: { select: { color: true, size: true } },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found with provided Order Number' });
    }

    const addr = typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;

    // Verify phone number match (either end of string or exact)
    const phoneMatch = addr && addr.phone && (
      addr.phone.replace(/\D/g, '').endsWith(cleanPhone.replace(/\D/g, '').slice(-7))
    );

    if (!phoneMatch) {
      return res.status(403).json({ error: 'Phone number does not match order record' });
    }

    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        items: order.items,
        shippingAddress: addr,
      },
    });
  } catch (err) {
    next(err);
  }
};

