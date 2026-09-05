import prisma from '../config/db.js';
import { postJournalEntry } from './journalEntry.controller.js';

export async function payInvoice(req, res, next) {
  try {
    const { invoiceId, amount, method } = req.body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(invoiceId) },
      include: { salesOrder: { include: { contact: true } } },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Authorization check for CONTACT_USER
    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId || invoice.salesOrder.contactId !== req.user.contactId) {
        return res.status(403).json({ message: 'Access forbidden: You can only pay your own invoices' });
      }
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId: Number(invoiceId),
        amount: Number(amount),
        method: method || 'BANK',
      },
    });

    const cashOrBankAccount = await prisma.account.findFirst({
      where: { name: method === 'CASH' ? 'Cash' : 'Bank' },
    });
    const debtorsAccount = await prisma.account.findFirst({ where: { name: 'Debtors' } });
    const journal = await prisma.journal.findFirst({
      where: { type: method === 'CASH' ? 'CASH' : 'BANK' },
    });

    if (cashOrBankAccount && debtorsAccount && journal) {
      await postJournalEntry({
        journalId: journal.id,
        reference: `PAY/${payment.id}`,
        lines: [
          {
            accountId: cashOrBankAccount.id,
            partnerId: invoice.salesOrder.contactId,
            debit: Number(amount),
            credit: 0,
          },
          {
            accountId: debtorsAccount.id,
            partnerId: invoice.salesOrder.contactId,
            debit: 0,
            credit: Number(amount),
          },
        ],
      });
    }

    const allPayments = await prisma.payment.findMany({
      where: { invoiceId: Number(invoiceId) },
    });
    const paidTotal = allPayments.reduce((s, p) => s + Number(p.amount), 0);

    const newStatus = paidTotal >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';
    await prisma.invoice.update({
      where: { id: Number(invoiceId) },
      data: { status: newStatus },
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

export async function payBill(req, res, next) {
  try {
    const { vendorBillId, amount, method } = req.body;

    const bill = await prisma.vendorBill.findUnique({
      where: { id: Number(vendorBillId) },
      include: { purchaseOrder: { include: { contact: true } } },
    });
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found' });

    // Authorization check for CONTACT_USER
    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId || bill.purchaseOrder.contactId !== req.user.contactId) {
        return res.status(403).json({ message: 'Access forbidden: You can only pay your own bills' });
      }
    }

    const payment = await prisma.payment.create({
      data: {
        vendorBillId: Number(vendorBillId),
        amount: Number(amount),
        method: method || 'BANK',
      },
    });

    const cashOrBankAccount = await prisma.account.findFirst({
      where: { name: method === 'CASH' ? 'Cash' : 'Bank' },
    });
    const creditorsAccount = await prisma.account.findFirst({ where: { name: 'Creditors' } });
    const journal = await prisma.journal.findFirst({
      where: { type: method === 'CASH' ? 'CASH' : 'BANK' },
    });

    if (cashOrBankAccount && creditorsAccount && journal) {
      await postJournalEntry({
        journalId: journal.id,
        reference: `PAY/${payment.id}`,
        lines: [
          {
            accountId: creditorsAccount.id,
            partnerId: bill.purchaseOrder.contactId,
            debit: Number(amount),
            credit: 0,
          },
          {
            accountId: cashOrBankAccount.id,
            partnerId: bill.purchaseOrder.contactId,
            debit: 0,
            credit: Number(amount),
          },
        ],
      });
    }

    const allPayments = await prisma.payment.findMany({
      where: { vendorBillId: Number(vendorBillId) },
    });
    const paidTotal = allPayments.reduce((s, p) => s + Number(p.amount), 0);

    const newStatus = paidTotal >= Number(bill.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';
    await prisma.vendorBill.update({
      where: { id: Number(vendorBillId) },
      data: { status: newStatus },
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

export async function listPayments(req, res, next) {
  try {
    const where = {};
    if (req.user.role === 'CONTACT_USER') {
      if (!req.user.contactId) {
        return res.status(403).json({ message: 'User account is not linked to a valid contact' });
      }
      where.OR = [
        { invoice: { salesOrder: { contactId: req.user.contactId } } },
        { vendorBill: { purchaseOrder: { contactId: req.user.contactId } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: { include: { salesOrder: { include: { contact: true } } } },
        vendorBill: { include: { purchaseOrder: { include: { contact: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
}
