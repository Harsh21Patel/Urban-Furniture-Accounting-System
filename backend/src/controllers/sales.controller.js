import prisma from '../config/db.js';
import { postJournalEntry } from './journalEntry.controller.js';
import { computeBudgetAchieved } from './budget.controller.js';

// --- Sales Orders ---

export async function createSalesOrder(req, res, next) {
  try {
    const { contactId, lines } = req.body;
    if (!contactId || !lines || lines.length === 0) {
      return res.status(400).json({ message: 'Customer and at least one order line are required' });
    }

    const formattedLines = lines.map((l) => ({
      productId: Number(l.productId),
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      discountPercent: Number(l.discountPercent || 0),
      taxPercent: Number(l.taxPercent || 0),
      analyticId: l.analyticId ? Number(l.analyticId) : null,
    }));

    const order = await prisma.salesOrder.create({
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

export async function confirmSalesOrder(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const order = await prisma.salesOrder.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order) return res.status(404).json({ message: 'Sales order not found' });

    // Budget-exceeded check
    const orderDate = order.createdAt || new Date();
    for (const line of order.lines) {
      if (!line.analyticId) continue;
      const baseSub = Number(line.unitPrice) * line.quantity;
      const discAmt = baseSub * (Number(line.discountPercent || 0) / 100);
      const taxable = baseSub - discAmt;
      const lineTotal = taxable * (1 + Number(line.taxPercent || 0) / 100);
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

    const confirmed = await prisma.salesOrder.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
      include: { contact: true, lines: { include: { product: true } } },
    });
    res.json(confirmed);
  } catch (err) {
    next(err);
  }
}

export async function listSalesOrders(req, res, next) {
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

    const orders = await prisma.salesOrder.findMany({
      where,
      include: {
        contact: true,
        lines: { include: { product: true, analytic: true } },
        invoice: { include: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// --- Invoices ---

export async function generateInvoice(req, res, next) {
  try {
    const salesOrderId = Number(req.params.id);
    const order = await prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { lines: { include: { analytic: true } }, contact: true },
    });
    if (!order) return res.status(404).json({ message: 'Sales order not found' });

    const existingInvoice = await prisma.invoice.findUnique({ where: { salesOrderId } });
    if (existingInvoice) {
      return res.status(409).json({ message: 'Invoice already generated for this Sales Order' });
    }

    const totalAmount = order.lines.reduce((sum, l) => {
      const baseSub = Number(l.unitPrice) * l.quantity;
      const discAmt = baseSub * (Number(l.discountPercent || 0) / 100);
      const taxable = baseSub - discAmt;
      return sum + taxable * (1 + Number(l.taxPercent || 0) / 100);
    }, 0);

    const invoice = await prisma.invoice.create({
      data: {
        salesOrderId,
        totalAmount,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      },
      include: { salesOrder: { include: { contact: true } } },
    });

    // Populate invoiceNumber with INV/id
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { invoiceNumber: `INV/${invoice.id}` },
      include: { salesOrder: { include: { contact: true } } },
    });

    const debtorsAccount = await prisma.account.findFirst({ where: { name: 'Debtors' } });
    const salesIncomeAccount = await prisma.account.findFirst({ where: { name: 'Sale Income' } });
    const salesJournal = await prisma.journal.findFirst({ where: { type: 'SALES' } });

    if (debtorsAccount && salesIncomeAccount && salesJournal) {
      // Find main analytic account from order lines if any
      const mainAnalyticId = order.lines.find((l) => l.analyticId)?.analyticId || null;

      await postJournalEntry({
        journalId: salesJournal.id,
        reference: `INV/${invoice.id}`,
        lines: [
          {
            accountId: debtorsAccount.id,
            partnerId: order.contactId,
            analyticId: mainAnalyticId,
            debit: totalAmount,
            credit: 0,
          },
          {
            accountId: salesIncomeAccount.id,
            partnerId: order.contactId,
            analyticId: mainAnalyticId,
            debit: 0,
            credit: totalAmount,
          },
        ],
      });
    }

    await prisma.salesOrder.update({ where: { id: salesOrderId }, data: { status: 'INVOICED' } });

    res.status(201).json(updatedInvoice);
  } catch (err) {
    next(err);
  }
}


export async function listInvoices(req, res, next) {
  try {
    const where = {};
    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId) {
        return res.status(403).json({ message: 'User account is not linked to a valid contact' });
      }
      where.salesOrder = { contactId: req.user.contactId };
    } else if (req.query.contactId) {
      where.salesOrder = { contactId: Number(req.query.contactId) };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        salesOrder: {
          include: {
            contact: true,
            lines: { include: { product: true, analytic: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        salesOrder: {
          include: {
            contact: true,
            lines: { include: { product: true, analytic: true } },
          },
        },
        payments: true,
      },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId || invoice.salesOrder.contactId !== req.user.contactId) {
        return res.status(403).json({ message: 'Access forbidden: You can only view your own invoices' });
      }
    }

    res.json(invoice);
  } catch (err) {
    next(err);
  }
}
