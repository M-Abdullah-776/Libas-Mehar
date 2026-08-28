const prisma = require('../utils/prisma');

exports.listMine = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { fullName, phone, street, city, province, postalCode, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !province) {
      return res.status(400).json({ error: 'fullName, phone, street, city, and province are required' });
    }

    const address = await prisma.address.create({
      data: { userId: req.user.id, fullName, phone, street, city, province, postalCode, isDefault: !!isDefault },
    });

    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const address = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!address || address.userId !== req.user.id) {
      return res.status(404).json({ error: 'Address not found' });
    }
    await prisma.address.delete({ where: { id: address.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
