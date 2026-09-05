import prisma from '../config/db.js';

// Core double-entry rule: sum(debit) must equal sum(credit) for a journal entry.
export async function postJournalEntry({ journalId, reference, date, lines }) {
  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw Object.assign(new Error('Journal entry not balanced: debit must equal credit'), {
      status: 400,
    });
  }

  return prisma.journalEntry.create({
    data: {
      journalId,
      reference,
      date: date || new Date(),
      lines: { create: lines },
    },
    include: { lines: true },
  });
}

export async function listJournalEntries(req, res, next) {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: { lines: { include: { account: true } }, journal: true },
      orderBy: { date: 'desc' },
    });
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

// Manual journal entry creation (for adjustments etc.)
export async function createJournalEntry(req, res, next) {
  try {
    const { journalId, reference, date, lines } = req.body;
    const entry = await postJournalEntry({ journalId, reference, date, lines });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}
