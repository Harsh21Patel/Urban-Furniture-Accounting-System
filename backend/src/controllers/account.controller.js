import prisma from '../config/db.js';

export async function listAccounts(req, res, next) {
  try {
    const items = await prisma.account.findMany({
      where: { archived: false },
      orderBy: { name: 'asc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getAccount(req, res, next) {
  try {
    const item = await prisma.account.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Account not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createAccount(req, res, next) {
  try {
    const { name, type } = req.body;
    const item = await prisma.account.create({
      data: { name, type },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req, res, next) {
  try {
    const item = await prisma.account.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function archiveAccount(req, res, next) {
  try {
    await prisma.account.update({
      where: { id: Number(req.params.id) },
      data: { archived: true },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
