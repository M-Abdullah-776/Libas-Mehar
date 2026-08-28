const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const { saveBase64Image } = require('../utils/upload');

/* ─── GET /admin/stats ─── */
exports.getStats = async (req, res, next) => {
  try {
    const [orders, products, users, subscribers, revenue, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.newsletterSubscriber.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { orderStatus: { not: 'CANCELLED' } } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } }, items: { take: 1 } },
      }),
    ]);

    const pendingOrders = await prisma.order.count({ where: { orderStatus: 'PLACED' } });
    const lowStock = await prisma.productVariant.count({ where: { stock: { lte: 5 } } });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    res.json({
      orders,
      products,
      users,
      subscribers,
      pendingOrders,
      lowStock,
      todayOrders,
      revenue: Number(revenue._sum.total || 0),
      recentOrders,
    });
  } catch (err) { next(err); }
};

/* ─── PRODUCTS ─── */
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        collection: { select: { name: true } },
        images: true,
        variants: { select: { stock: true } },
      },
    });
    res.json({ products });
  } catch (err) { next(err); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, slug, description, basePrice, collectionId, isBestseller, imageUrl, imageUrl2 } = req.body;
    if (!name || !slug || !description || !basePrice) {
      return res.status(400).json({ error: 'name, slug, description, basePrice are required' });
    }
    
    let finalImageUrl = imageUrl;
    let finalImageUrl2 = imageUrl2;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      finalImageUrl = await saveBase64Image(imageUrl, 'products');
    }
    if (imageUrl2 && imageUrl2.startsWith('data:image')) {
      finalImageUrl2 = await saveBase64Image(imageUrl2, 'products');
    }

    const imagesData = [];
    if (finalImageUrl) imagesData.push({ url: finalImageUrl, sortOrder: 0 });
    if (finalImageUrl2) imagesData.push({ url: finalImageUrl2, sortOrder: 1 });

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        basePrice: parseFloat(basePrice),
        collectionId: collectionId || undefined,
        isBestseller: !!isBestseller,
        images: imagesData.length > 0 ? { create: imagesData } : undefined,
      },
      include: { images: true },
    });
    res.status(201).json({ product });
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, basePrice, isBestseller, isActive, imageUrl, imageUrl2 } = req.body;

    let finalImageUrl = imageUrl;
    let finalImageUrl2 = imageUrl2;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      finalImageUrl = await saveBase64Image(imageUrl, 'products');
    }
    if (imageUrl2 && imageUrl2.startsWith('data:image')) {
      finalImageUrl2 = await saveBase64Image(imageUrl2, 'products');
    }

    if (imageUrl !== undefined || imageUrl2 !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      const imagesData = [];
      if (finalImageUrl) imagesData.push({ url: finalImageUrl, sortOrder: 0 });
      if (finalImageUrl2) imagesData.push({ url: finalImageUrl2, sortOrder: 1 });
      if (imagesData.length > 0) {
        await prisma.productImage.createMany({
          data: imagesData.map((img) => ({ ...img, productId: id })),
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(isBestseller !== undefined && { isBestseller }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ product });
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
};

/* ─── ORDERS ─── */
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { name: true } },
            variant: { select: { color: true, size: true } },
          },
        },
      },
    });
    res.json({ orders });
  } catch (err) { next(err); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const VALID = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!VALID.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const order = await prisma.order.update({ where: { id }, data: { orderStatus: status } });
    res.json({ order });
  } catch (err) { next(err); }
};

/* ─── USERS ─── */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    res.json({ users });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'CUSTOMER'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await prisma.user.update({ where: { id }, data: { role } });
    res.json({ user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) { next(err); }
};

/* ─── COLLECTIONS ─── */
exports.getAllCollections = async (req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        discipline: { select: { name: true } },
        _count: { select: { products: true } },
      },
    });
    res.json({ collections });
  } catch (err) { next(err); }
};

exports.createCollection = async (req, res, next) => {
  try {
    const { name, slug, tagline, disciplineId, heroImageUrl } = req.body;
    if (!name || !slug || !disciplineId) return res.status(400).json({ error: 'name, slug, disciplineId required' });
    let finalHeroImageUrl = heroImageUrl;
    if (heroImageUrl && heroImageUrl.startsWith('data:image')) {
      finalHeroImageUrl = await saveBase64Image(heroImageUrl, 'collections');
    }
    const collection = await prisma.collection.create({
      data: { name, slug, tagline, disciplineId, heroImageUrl: finalHeroImageUrl },
    });
    res.status(201).json({ collection });
  } catch (err) { next(err); }
};

exports.updateCollection = async (req, res, next) => {
  try {
    const { name, slug, tagline, disciplineId, heroImageUrl } = req.body;
    let finalHeroImageUrl = heroImageUrl;
    if (heroImageUrl && heroImageUrl.startsWith('data:image')) {
      finalHeroImageUrl = await saveBase64Image(heroImageUrl, 'collections');
    }
    const collection = await prisma.collection.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(tagline !== undefined && { tagline }),
        ...(disciplineId !== undefined && { disciplineId }),
        ...(heroImageUrl !== undefined && { heroImageUrl: finalHeroImageUrl }),
      },
    });
    res.json({ collection });
  } catch (err) { next(err); }
};

exports.deleteCollection = async (req, res, next) => {
  try {
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.json({ message: 'Collection deleted' });
  } catch (err) { next(err); }
};

/* ─── NEWSLETTER ─── */
exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ subscribers });
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!['ADMIN', 'CUSTOMER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role },
    });
    
    // Create an empty cart for the new user
    await prisma.cart.create({ data: { userId: user.id } });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (err) { next(err); }
};

const mailer = require('../utils/mailer');
exports.sendNewsletter = async (req, res, next) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    const subscribers = await prisma.newsletterSubscriber.findMany();
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No subscribers to send to' });
    }

    // Send emails in background
    for (const sub of subscribers) {
      const html = `
        <div style="background-color:#FAF7F2;padding:30px 20px;font-family:sans-serif;">
          <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #DDD5C7;padding:40px;">
            <div style="text-align:center;margin-bottom:30px;border-bottom:1px solid #DDD5C7;padding-bottom:20px;">
              <h1 style="color:#1C1A17;font-size:26px;margin:0;font-weight:normal;letter-spacing:1px;">
                Libas <span style="font-style:italic;color:#A8823D;">Mehar</span>
              </h1>
            </div>
            <div style="font-size:15px;color:#1C1A17;line-height:1.6;">
              ${body.replace(/\n/g, '<br>')}
            </div>
            <p style="text-align:center;font-size:12px;color:#6B6560;margin-top:40px;border-top:1px dashed #DDD5C7;padding-top:15px;">
              You received this email because you subscribed to our newsletter.<br>
              <strong>Team Libas Mehar</strong>
            </p>
          </div>
        </div>
      `;
      mailer.sendMail({ to: sub.email, subject, html }).catch(err =>
        console.error(`Error sending newsletter to ${sub.email}:`, err)
      );
    }

    res.json({ message: `Newsletter sent successfully to ${subscribers.length} subscribers` });
  } catch (err) {
    next(err);
  }
};

