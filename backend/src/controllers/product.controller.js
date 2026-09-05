import prisma from "../config/db.js";

// Follow the same pattern as contact.controller.js:
// listContacts -> listProducts, getContact -> getProduct, createContact -> createProduct, etc.
// Swap prisma.contact.* for prisma.product.*

export async function listProducts(req, res, next) {
  try {
    const items = await prisma.product.findMany();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const item = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: "Product not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const item = await prisma.product.create({ data: req.body });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const item = await prisma.product.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
