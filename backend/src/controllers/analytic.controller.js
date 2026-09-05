import prisma from "../config/db.js";

// Follow the same pattern as contact.controller.js:
// listContacts -> listAnalytics, getContact -> getAnalytic, createContact -> createAnalytic, etc.
// Swap prisma.contact.* for prisma.analytic.*

export async function listAnalytics(req, res, next) {
  try {
    const items = await prisma.analytic.findMany();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getAnalytic(req, res, next) {
  try {
    const item = await prisma.analytic.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: "Analytic not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createAnalytic(req, res, next) {
  try {
    const item = await prisma.analytic.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateAnalytic(req, res, next) {
  try {
    const item = await prisma.analytic.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
