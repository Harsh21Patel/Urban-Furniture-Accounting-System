import prisma from '../config/db.js';
import { postJournalEntry } from './journalEntry.controller.js';

// --- Sales Order ---

export async function createSalesOrder(req, res, next) {
  try {
    const { contactId, lines } = req.body; // lines: [{ productId, quantity, unitPrice, taxPercent }]
    const order = await prisma.salesOrder.create({
      data: {
        contactId,
        lines: { create: lines },
      },
      include: { lines: true },
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function confirmSalesOrder(req, res, next) {
  try {
    const order = await prisma.salesOrder.update({
      where: { id: Number(req.params.id) },
      data: { status: 'CONFIRMED' },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function listSalesOrders(req, res, next) {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: { contact: true, lines: { include: { product: true } } },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// --- Customer Invoice (generated from a Sales Order) ---
// Business logic: Debit Debtors (Asset), Credit Sales Income

export async function generateInvoice(req, res, next) {
  try {
    const salesOrderId = Number(req.params.id);
    const order = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { lines: true },
    });
    if (!order) return res.status(404).json({ message: 'Sales order not found' });

    const totalAmount = order.lines.reduce(
      (sum, l) => sum + Number(l.unitPrice) * l.quantity * (1 + Number(l.taxPercent) / 100),
      0
    );

    const invoice = await prisma.invoice.create({
      data: { salesOrderId, totalAmount, dueDate: req.body.dueDate },
    });

    // Look up default accounts — in a real build these come from the Sales Journal config
    const debtorsAccount = await prisma.account.findFirst({ where: { name: 'Debtors' } });
    const salesIncomeAccount = await prisma.account.findFirst({ where: { name: 'Sale Income' } });
    const salesJournal = await prisma.journal.findFirst({ where: { type: 'SALES' } });

    await postJournalEntry({
      journalId: salesJournal.id,
      reference: `INV/${invoice.id}`,
      lines: [
        { accountId: debtorsAccount.id, debit: totalAmount, credit: 0 },
        { accountId: salesIncomeAccount.id, debit: 0, credit: totalAmount },
      ],
    });

    await prisma.salesOrder.update({ where: { id: salesOrderId }, data: { status: 'INVOICED' } });

    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
}
