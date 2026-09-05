import prisma from '../config/db.js';
import { postJournalEntry } from './journalEntry.controller.js';

// --- Purchase Order ---

export async function createPurchaseOrder(req, res, next) {
  try {
    const { contactId, lines } = req.body; // lines: [{ productId, quantity, unitPrice }]
    const order = await prisma.purchaseOrder.create({
      data: { contactId, lines: { create: lines } },
      include: { lines: true },
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function listPurchaseOrders(req, res, next) {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: { contact: true, lines: { include: { product: true } } },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// --- Vendor Bill (PO converted to Bill on goods receipt) ---
// Business logic: Debit Purchase Expense, Credit Creditors

export async function convertToBill(req, res, next) {
  try {
    const purchaseOrderId = Number(req.params.id);
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { lines: true },
    });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });

    const totalAmount = order.lines.reduce((sum, l) => sum + Number(l.unitPrice) * l.quantity, 0);

    const bill = await prisma.vendorBill.create({
      data: { purchaseOrderId, totalAmount, dueDate: req.body.dueDate },
    });

    const purchaseExpenseAccount = await prisma.account.findFirst({
      where: { name: 'Purchases Expense' },
    });
    const creditorsAccount = await prisma.account.findFirst({ where: { name: 'Creditors' } });
    const purchaseJournal = await prisma.journal.findFirst({ where: { type: 'PURCHASE' } });

    await postJournalEntry({
      journalId: purchaseJournal.id,
      reference: `BILL/${bill.id}`,
      lines: [
        { accountId: purchaseExpenseAccount.id, debit: totalAmount, credit: 0 },
        { accountId: creditorsAccount.id, debit: 0, credit: totalAmount },
      ],
    });

    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'INVOICED' },
    });

    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
}
