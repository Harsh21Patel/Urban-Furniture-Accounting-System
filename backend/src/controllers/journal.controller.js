import prisma from '../config/db.js';

export async function listJournals(req, res, next) {
  try {
    const items = await prisma.journal.findMany({
      include: { defaultAccount: true },
      orderBy: { id: 'asc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getJournal(req, res, next) {
  try {
    const item = await prisma.journal.findUnique({
      where: { id: Number(req.params.id) },
      include: { defaultAccount: true },
    });
    if (!item) return res.status(404).json({ message: 'Journal not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createJournal(req, res, next) {
  try {
    const { name, type, defaultAccountId } = req.body;
    const item = await prisma.journal.create({
      data: {
        name,
        type,
        defaultAccountId: defaultAccountId ? Number(defaultAccountId) : null,
      },
      include: { defaultAccount: true },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateJournal(req, res, next) {
  try {
    const { name, type, defaultAccountId } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (defaultAccountId !== undefined)
      updateData.defaultAccountId = defaultAccountId ? Number(defaultAccountId) : null;

    const item = await prisma.journal.update({
      where: { id: Number(req.params.id) },
      data: updateData,
      include: { defaultAccount: true },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
