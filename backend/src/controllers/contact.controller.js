import prisma from '../config/db.js';
import { isValidEmail } from '../utils/validators.js';

export async function listContacts(req, res, next) {
  try {
    const { includeArchived, type } = req.query;
    const where = {};

    if (includeArchived !== 'true') {
      where.archived = false;
    }

    if (type && ['CUSTOMER', 'VENDOR', 'BOTH'].includes(type.toUpperCase())) {
      where.type = type.toUpperCase();
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        users: {
          select: { id: true, loginId: true, role: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

export async function getContact(req, res, next) {
  try {
    const contactId = Number(req.params.id);
    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId || req.user.contactId !== contactId) {
        return res.status(403).json({ message: 'Access forbidden: You can only view your own contact record' });
      }
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        users: { select: { id: true, loginId: true, role: true, email: true } },
      },
    });

    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (err) {
    next(err);
  }
}

export async function createContact(req, res, next) {
  try {
    const { name, type, email, mobile, street, city, state, country, pincode, imageUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Contact name is required' });
    }
    if (!type || !['CUSTOMER', 'VENDOR', 'BOTH'].includes(type)) {
      return res.status(400).json({ message: 'Valid contact type (CUSTOMER, VENDOR, BOTH) is required' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    const contact = await prisma.contact.create({
      data: {
        name: name.trim(),
        type,
        email: email.trim(),
        mobile: mobile ? mobile.trim() : null,
        street: street ? street.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim() : null,
        country: country ? country.trim() : null,
        pincode: pincode ? pincode.trim() : null,
        imageUrl: imageUrl || null,
      },
      include: { users: true },
    });

    res.status(201).json(contact);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'A contact with this email already exists' });
    next(err);
  }
}

export async function updateContact(req, res, next) {
  try {
    const { name, type, email, mobile, street, city, state, country, pincode, imageUrl } = req.body;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }
    if (type && !['CUSTOMER', 'VENDOR', 'BOTH'].includes(type)) {
      return res.status(400).json({ message: 'Valid contact type (CUSTOMER, VENDOR, BOTH) is required' });
    }

    const contact = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(type ? { type } : {}),
        ...(email ? { email: email.trim() } : {}),
        ...(mobile !== undefined ? { mobile: mobile ? mobile.trim() : null } : {}),
        ...(street !== undefined ? { street: street ? street.trim() : null } : {}),
        ...(city !== undefined ? { city: city ? city.trim() : null } : {}),
        ...(state !== undefined ? { state: state ? state.trim() : null } : {}),
        ...(country !== undefined ? { country: country ? country.trim() : null } : {}),
        ...(pincode !== undefined ? { pincode: pincode ? pincode.trim() : null } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      },
      include: { users: true },
    });
    res.json(contact);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'A contact with this email already exists' });
    next(err);
  }
}

// Soft delete — archive contact (ADMIN only)
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

// Unarchive contact (ADMIN only)
export async function unarchiveContact(req, res, next) {
  try {
    const contact = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data: { archived: false },
    });
    res.json(contact);
  } catch (err) {
    next(err);
  }
}
