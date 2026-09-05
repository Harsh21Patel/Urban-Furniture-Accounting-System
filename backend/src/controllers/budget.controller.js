import prisma from "../config/db.js";

// Follow the same pattern as contact.controller.js:
// listContacts -> listBudgets, getContact -> getBudget, createContact -> createBudget, etc.
// Swap prisma.contact.* for prisma.budget.*

export async function listBudgets(req, res, next) {
  try {
    const items = await prisma.budget.findMany();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getBudget(req, res, next) {
  try {
    const item = await prisma.budget.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: "Budget not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createBudget(req, res, next) {
  try {
    const item = await prisma.budget.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateBudget(req, res, next) {
  try {
    const item = await prisma.budget.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
