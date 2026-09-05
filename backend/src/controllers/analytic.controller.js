import prisma from '../config/db.js';

export async function listAnalytics(req, res, next) {
  try {
    const items = await prisma.analyticAccount.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getAnalytic(req, res, next) {
  try {
    const item = await prisma.analyticAccount.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!item) return res.status(404).json({ message: 'Analytic account not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createAnalytic(req, res, next) {
  try {
    const { name, type } = req.body;
    const item = await prisma.analyticAccount.create({
      data: { name, type: type || 'EXPENSE' },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateAnalytic(req, res, next) {
  try {
    const item = await prisma.analyticAccount.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
