import prisma from "../config/db.js";

// Follow the same pattern as contact.controller.js:
// listContacts -> listJournals, getContact -> getJournal, createContact -> createJournal, etc.
// Swap prisma.contact.* for prisma.journal.*

export async function listJournals(req, res, next) {
  try {
    const items = await prisma.journal.findMany();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getJournal(req, res, next) {
  try {
    const item = await prisma.journal.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: "Journal not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createJournal(req, res, next) {
  try {
    const item = await prisma.journal.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateJournal(req, res, next) {
  try {
    const item = await prisma.journal.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
