const prisma = require('../utils/prisma');

exports.listAll = async (req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      include: { discipline: { select: { name: true, slug: true } } },
    });
    res.json({ collections });
  } catch (err) {
    next(err);
  }
};

// GET /api/collections/:slug?page=1&limit=12
// Powers pages like "Egyptian Giza" showing all products in that House
exports.getBySlug = async (req, res, next) => {
  try {
    let slug = req.params.slug;
    if (slug === 'fabric') slug = 'fabrics';
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    let collection = await prisma.collection.findUnique({
      where: { slug },
      include: { discipline: true },
    });

    if (!collection) {
      // Try to find a discipline with this slug
      const discipline = await prisma.discipline.findUnique({
        where: { slug },
        include: { collections: true },
      });

      if (!discipline) {
        return res.status(404).json({ error: 'Collection or category not found' });
      }

      // If it is a discipline, find all products in all collections under this discipline
      const collectionIds = discipline.collections.map((c) => c.id);
      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where: { collectionId: { in: collectionIds }, isActive: true },
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            variants: { select: { id: true, color: true, size: true, stock: true } },
            collection: { select: { name: true, slug: true } },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({
          where: { collectionId: { in: collectionIds }, isActive: true },
        }),
      ]);

      return res.json({
        collection: {
          name: discipline.name,
          slug: discipline.slug,
          tagline: discipline.description || `Premium ${discipline.name}'s Wear`,
        },
        products,
        pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
      });
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { collectionId: collection.id, isActive: true },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: { select: { id: true, color: true, size: true, stock: true } },
          collection: { select: { name: true, slug: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: { collectionId: collection.id, isActive: true } }),
    ]);

    res.json({
      collection,
      products,
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (err) {
    next(err);
  }
};
