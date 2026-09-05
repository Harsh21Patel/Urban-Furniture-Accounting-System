import prisma from "../config/db.js";

// Follow the same pattern as contact.controller.js:
// listContacts -> listAccounts, getContact -> getAccount, createContact -> createAccount, etc.
// Swap prisma.contact.* for prisma.account.*

export async function listAccounts(req, res, next) {
  try {
    const items = await prisma.account.findMany();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getAccount(req, res, next) {
  try {
    const item = await prisma.account.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: "Account not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createAccount(req, res, next) {
  try {
    const item = await prisma.account.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateAccount(req, res, next) {
  try {
    const item = await prisma.account.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
