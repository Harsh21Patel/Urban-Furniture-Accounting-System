import prisma from '../config/db.js';

export async function listProducts(req, res, next) {
  try {
    const items = await prisma.product.findMany({
      where: { archived: false },
      orderBy: { id: 'desc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const item = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Product not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, type, category, salesPrice, cost, imageUrl } = req.body;
    const item = await prisma.product.create({
      data: {
        name,
        type: type || 'GOODS',
        category: category || 'General',
        salesPrice: Number(salesPrice || 0),
        cost: Number(cost || 0),
        imageUrl: imageUrl || null,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { salesPrice, cost, ...rest } = req.body;
    const updateData = { ...rest };
    if (salesPrice !== undefined) updateData.salesPrice = Number(salesPrice);
    if (cost !== undefined) updateData.cost = Number(cost);

    const item = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: updateData,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function archiveProduct(req, res, next) {
  try {
    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { archived: true },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
