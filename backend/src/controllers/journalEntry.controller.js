import prisma from '../config/db.js';

export async function postJournalEntry({ journalId, reference, date, lines, status = 'POSTED' }) {
  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw Object.assign(new Error(`Journal entry not balanced: total Debit (Rs. ${totalDebit.toFixed(2)}) must equal total Credit (Rs. ${totalCredit.toFixed(2)})`), {
      status: 400,
    });
  }

  const formattedLines = lines.map((l) => ({
    accountId: Number(l.accountId),
    partnerId: l.partnerId ? Number(l.partnerId) : null,
    analyticId: l.analyticId ? Number(l.analyticId) : null,
    debit: Number(l.debit || 0),
    credit: Number(l.credit || 0),
  }));

  return prisma.journalEntry.create({
    data: {
      journalId: Number(journalId),
      reference: reference || null,
      date: date ? new Date(date) : new Date(),
      status: status || 'POSTED',
      lines: { create: formattedLines },
    },
    include: {
      lines: {
        include: {
          account: true,
          partner: true,
          analytic: true,
        },
      },
      journal: true,
    },
  });
}

export async function listJournalEntries(req, res, next) {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
            partner: true,
            analytic: true,
          },
        },
        journal: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

export async function createJournalEntry(req, res, next) {
  try {
    const { journalId, reference, date, lines, status } = req.body;
    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ message: 'Journal entry must contain at least one line item' });
    }
    const entry = await postJournalEntry({ journalId, reference, date, lines, status });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}
