import prisma from '../config/db.js';

export async function listProducts(req, res, next) {
  try {
    const { includeArchived, type, category } = req.query;
    const where = {};
    
    if (includeArchived !== 'true' && includeArchived !== '1') {
      where.archived = false;
    }
    if (type) {
      where.type = type;
    }
    if (category) {
      where.category = category;
    }

    const items = await prisma.product.findMany({
      where,
      orderBy: { id: 'desc' },
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const item = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) return res.status(404).json({ message: 'Product not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const { name, type, category, salesPrice, cost, imageUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!type || !['GOODS', 'SERVICE', 'COMBO'].includes(type)) {
      return res.status(400).json({ message: 'Product type must be GOODS, SERVICE, or COMBO' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }
    const numSalesPrice = Number(salesPrice);
    if (isNaN(numSalesPrice) || numSalesPrice < 0) {
      return res.status(400).json({ message: 'Sales price must be a non-negative number' });
    }
    const numCost = Number(cost);
    if (isNaN(numCost) || numCost < 0) {
      return res.status(400).json({ message: 'Cost price must be a non-negative number' });
    }

    const item = await prisma.product.create({
      data: {
        name: name.trim(),
        type,
        category: category.trim(),
        salesPrice: numSalesPrice,
        cost: numCost,
        imageUrl: imageUrl || null,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { name, type, category, salesPrice, cost, imageUrl } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'Product name cannot be empty' });
      updateData.name = name.trim();
    }
    if (type !== undefined) {
      if (!['GOODS', 'SERVICE', 'COMBO'].includes(type)) {
        return res.status(400).json({ message: 'Product type must be GOODS, SERVICE, or COMBO' });
      }
      updateData.type = type;
    }
    if (category !== undefined) {
      if (!category.trim()) return res.status(400).json({ message: 'Category cannot be empty' });
      updateData.category = category.trim();
    }
    if (salesPrice !== undefined) {
      const numSalesPrice = Number(salesPrice);
      if (isNaN(numSalesPrice) || numSalesPrice < 0) {
        return res.status(400).json({ message: 'Sales price must be a non-negative number' });
      }
      updateData.salesPrice = numSalesPrice;
    }
    if (cost !== undefined) {
      const numCost = Number(cost);
      if (isNaN(numCost) || numCost < 0) {
        return res.status(400).json({ message: 'Cost price must be a non-negative number' });
      }
      updateData.cost = numCost;
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null;
    }

    const item = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: updateData,
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function archiveProduct(req, res, next) {
  try {
    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { archived: true },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function unarchiveProduct(req, res, next) {
  try {
    const item = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { archived: false },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}
