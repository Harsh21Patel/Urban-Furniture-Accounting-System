import prisma from '../config/db.js';
import { postJournalEntry } from './journalEntry.controller.js';

// Receiving payment against a Customer Invoice: Debit Cash/Bank, Credit Debtors
export async function payInvoice(req, res, next) {
  try {
    const { invoiceId, amount, method } = req.body; // method: 'CASH' | 'BANK'

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const payment = await prisma.payment.create({
      data: { invoiceId, amount, method },
    });

    const cashOrBankAccount = await prisma.account.findFirst({
      where: { name: method === 'CASH' ? 'Cash' : 'Bank' },
    });
    const debtorsAccount = await prisma.account.findFirst({ where: { name: 'Debtors' } });
    const journal = await prisma.journal.findFirst({
      where: { type: method === 'CASH' ? 'CASH' : 'BANK' },
    });

    await postJournalEntry({
      journalId: journal.id,
      reference: `PAY/${payment.id}`,
      lines: [
        { accountId: cashOrBankAccount.id, debit: amount, credit: 0 },
        { accountId: debtorsAccount.id, debit: 0, credit: amount },
      ],
    });

    const newStatus = Number(amount) >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

// Paying a Vendor Bill: Debit Creditors, Credit Cash/Bank
export async function payBill(req, res, next) {
  try {
    const { vendorBillId, amount, method } = req.body;

    const bill = await prisma.vendorBill.findUnique({ where: { id: vendorBillId } });
    if (!bill) return res.status(404).json({ message: 'Vendor bill not found' });

    const payment = await prisma.payment.create({
      data: { vendorBillId, amount, method },
    });

    const cashOrBankAccount = await prisma.account.findFirst({
      where: { name: method === 'CASH' ? 'Cash' : 'Bank' },
    });
    const creditorsAccount = await prisma.account.findFirst({ where: { name: 'Creditors' } });
    const journal = await prisma.journal.findFirst({
      where: { type: method === 'CASH' ? 'CASH' : 'BANK' },
    });

    await postJournalEntry({
      journalId: journal.id,
      reference: `PAY/${payment.id}`,
      lines: [
        { accountId: creditorsAccount.id, debit: amount, credit: 0 },
        { accountId: cashOrBankAccount.id, debit: 0, credit: amount },
      ],
    });

    const newStatus = Number(amount) >= Number(bill.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';
    await prisma.vendorBill.update({ where: { id: vendorBillId }, data: { status: newStatus } });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}
