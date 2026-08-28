const prisma = require('../utils/prisma');

// GET /api/disciplines — powers the top nav: Fabric / Leather / Fragrance / Gift Box
exports.listAll = async (req, res, next) => {
  try {
    const disciplines = await prisma.discipline.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { collections: { select: { id: true, name: true, slug: true, tagline: true, heroImageUrl: true } } },
    });
    res.json({ disciplines });
  } catch (err) {
    next(err);
  }
};

// GET /api/disciplines/:slug — e.g. "fabric" -> all its collections ("Houses of Cloth")
exports.getBySlug = async (req, res, next) => {
  try {
    const discipline = await prisma.discipline.findUnique({
      where: { slug: req.params.slug },
      include: { collections: true },
    });
    if (!discipline) return res.status(404).json({ error: 'Discipline not found' });
    res.json({ discipline });
  } catch (err) {
    next(err);
  }
};
