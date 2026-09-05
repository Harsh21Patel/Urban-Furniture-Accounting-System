import prisma from '../config/db.js';
import { postJournalEntry } from './journalEntry.controller.js';

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
    const order = await prisma.salesOrder.update({
      where: { id: Number(req.params.id) },
      data: { status: 'CONFIRMED' },
      include: { contact: true, lines: { include: { product: true } } },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function listSalesOrders(req, res, next) {
  try {
    const orders = await prisma.salesOrder.findMany({
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

    const totalAmount = order.lines.reduce(
      (sum, l) => sum + Number(l.unitPrice) * l.quantity * (1 + Number(l.taxPercent) / 100),
      0
    );

    const invoice = await prisma.invoice.create({
      data: {
        salesOrderId,
        totalAmount,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      },
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

    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
}

export async function listInvoices(req, res, next) {
  try {
    const { contactId } = req.query;
    const where = {};
    if (contactId) {
      where.salesOrder = { contactId: Number(contactId) };
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
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}
