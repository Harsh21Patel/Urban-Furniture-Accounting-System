import prisma from '../config/db.js';
import { postJournalEntry } from './journalEntry.controller.js';
import { computeBudgetAchieved } from './budget.controller.js';

// --- Purchase Orders ---

export async function createPurchaseOrder(req, res, next) {
  try {
    const { contactId, lines } = req.body;
    if (!contactId || !lines || lines.length === 0) {
      return res.status(400).json({ message: 'Vendor and at least one order line are required' });
    }

    const formattedLines = lines.map((l) => ({
      productId: Number(l.productId),
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      taxPercent: Number(l.taxPercent || 0),
      analyticId: l.analyticId ? Number(l.analyticId) : null,
    }));

    const order = await prisma.purchaseOrder.create({
      data: {
        contactId: Number(contactId),
        status: 'DRAFT',
        lines: { create: formattedLines },
      },
      include: {
        contact: true,
        lines: { include: { product: true, analytic: true } },
      },
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function confirmPurchaseOrder(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });

    // Budget-exceeded check
    const orderDate = order.createdAt || new Date();
    for (const line of order.lines) {
      if (!line.analyticId) continue;
      const lineTotal = Number(line.unitPrice) * line.quantity * (1 + Number(line.taxPercent) / 100);
      const budgets = await prisma.budget.findMany({
        where: {
          analyticId: line.analyticId,
          status: 'CONFIRMED',
          periodStart: { lte: orderDate },
          periodEnd: { gte: orderDate },
        },
      });
      for (const budget of budgets) {
        const achieved = await computeBudgetAchieved(budget);
        const remaining = Math.max(0, Number(budget.committedAmount) - achieved);
        if (lineTotal > remaining) {
          return res.status(400).json({
            message: `Exceeds Approved Budget: The entered amount is higher than the remaining budget amount for this budget line. Consider adjusting the value or revise the budget. (Remaining: ₹${remaining.toFixed(2)})`,
          });
        }
      }
    }

    const confirmed = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
      include: { contact: true, lines: { include: { product: true } } },
    });
    res.json(confirmed);
  } catch (err) {
    next(err);
  }
}

export async function listPurchaseOrders(req, res, next) {
  try {
    const where = {};
    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId) {
        return res.status(403).json({ message: 'User account is not linked to a valid contact' });
      }
      where.contactId = req.user.contactId;
    } else if (req.query.contactId) {
      where.contactId = Number(req.query.contactId);
    }

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        contact: true,
        lines: { include: { product: true, analytic: true } },
        bill: { include: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// --- Vendor Bills ---

export async function convertToBill(req, res, next) {
  try {
    const purchaseOrderId = Number(req.params.id);
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { lines: { include: { analytic: true } }, contact: true },
    });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });

    const existingBill = await prisma.vendorBill.findUnique({ where: { purchaseOrderId } });
    if (existingBill) {
      return res.status(409).json({ message: 'Vendor Bill already generated for this Purchase Order' });
    }

    const totalAmount = order.lines.reduce(
      (sum, l) => sum + Number(l.unitPrice) * l.quantity * (1 + Number(l.taxPercent) / 100),
      0
    );

    const bill = await prisma.vendorBill.create({
      data: {
        purchaseOrderId,
        totalAmount,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      },
      include: { purchaseOrder: { include: { contact: true } } },
    });

    const updatedBill = await prisma.vendorBill.update({
      where: { id: bill.id },
      data: { billNumber: `BILL/${bill.id}` },
      include: { purchaseOrder: { include: { contact: true } } },
    });

    const purchaseExpenseAccount = await prisma.account.findFirst({
      where: { name: 'Purchases Expense' },
    });
    const creditorsAccount = await prisma.account.findFirst({ where: { name: 'Creditors' } });
    const purchaseJournal = await prisma.journal.findFirst({ where: { type: 'PURCHASE' } });

    if (purchaseExpenseAccount && creditorsAccount && purchaseJournal) {
      const mainAnalyticId = order.lines.find((l) => l.analyticId)?.analyticId || null;

      await postJournalEntry({
        journalId: purchaseJournal.id,
        reference: `BILL/${bill.id}`,
        lines: [
          {
            accountId: purchaseExpenseAccount.id,
            partnerId: order.contactId,
            analyticId: mainAnalyticId,
            debit: totalAmount,
            credit: 0,
          },
          {
            accountId: creditorsAccount.id,
            partnerId: order.contactId,
            analyticId: mainAnalyticId,
            debit: 0,
            credit: totalAmount,
          },
        ],
      });
    }

    await prisma.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'INVOICED' },
    });

    res.status(201).json(updatedBill);
  } catch (err) {
    next(err);
  }
}


export async function listVendorBills(req, res, next) {
  try {
    const where = {};
    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId) {
        return res.status(403).json({ message: 'User account is not linked to a valid contact' });
      }
      where.purchaseOrder = { contactId: req.user.contactId };
    } else if (req.query.contactId) {
      where.purchaseOrder = { contactId: Number(req.query.contactId) };
    }

    const bills = await prisma.vendorBill.findMany({
      where,
      include: {
        purchaseOrder: {
          include: {
            contact: true,
            lines: { include: { product: true, analytic: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bills);
  } catch (err) {
    next(err);
  }
}

export async function getVendorBill(req, res, next) {
  try {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        purchaseOrder: {
          include: {
            contact: true,
            lines: { include: { product: true, analytic: true } },
          },
        },
        payments: true,
      },
    });
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found' });

    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId || bill.purchaseOrder.contactId !== req.user.contactId) {
        return res.status(403).json({ message: 'Access forbidden: You can only view your own bills' });
      }
    }

    res.json(bill);
  } catch (err) {
    next(err);
  }
}
