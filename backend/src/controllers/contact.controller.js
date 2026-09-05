import prisma from '../config/db.js';

export async function listContacts(req, res, next) {
  try {
    const contacts = await prisma.contact.findMany({ where: { archived: false } });
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

export async function getContact(req, res, next) {
  try {
    const contact = await prisma.contact.findUnique({ where: { id: Number(req.params.id) } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
}

export async function createContact(req, res, next) {
  try {
    const { name, type, email, mobile, street, city, state, country, pincode, imageUrl } = req.body;
    const contact = await prisma.contact.create({
      data: { name, type, email, mobile, street, city, state, country, pincode, imageUrl },
    });
    res.status(201).json(contact);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Email already exists' });
    next(err);
  }
}

export async function updateContact(req, res, next) {
  try {
    const contact = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(contact);
  } catch (err) {
    next(err);
  }
}

// Soft delete — accounting records should never be hard-deleted
export async function archiveContact(req, res, next) {
  try {
    await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data: { archived: true },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
