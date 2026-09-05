import prisma from '../config/db.js';

export async function validateJournalEntryData({ journalId, lines }) {
  if (!journalId) {
    const err = new Error('Journal is required');
    err.status = 400;
    throw err;
  }

  const journal = await prisma.journal.findUnique({ where: { id: Number(journalId) } });
  if (!journal) {
    const err = new Error(`Invalid journal ID: ${journalId}`);
    err.status = 400;
    throw err;
  }

  if (!lines || !Array.isArray(lines) || lines.length < 2) {
    const err = new Error('A journal entry must contain at least two line items');
    err.status = 400;
    throw err;
  }

  let totalDebit = 0;
  let totalCredit = 0;

  const formattedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const accountId = Number(line.accountId);

    if (!accountId) {
      const err = new Error(`Line ${i + 1}: Account is required`);
      err.status = 400;
      throw err;
    }

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      const err = new Error(`Line ${i + 1}: Account ID ${accountId} not found`);
      err.status = 400;
      throw err;
    }

    let partnerId = null;
    if (line.partnerId) {
      partnerId = Number(line.partnerId);
      const partner = await prisma.contact.findUnique({ where: { id: partnerId } });
      if (!partner) {
        const err = new Error(`Line ${i + 1}: Partner ID ${partnerId} not found`);
        err.status = 400;
        throw err;
      }
    }

    let analyticId = null;
    if (line.analyticId) {
      analyticId = Number(line.analyticId);
      const analytic = await prisma.analyticAccount.findUnique({ where: { id: analyticId } });
      if (!analytic) {
        const err = new Error(`Line ${i + 1}: Analytic Account ID ${analyticId} not found`);
        err.status = 400;
        throw err;
      }
    }

    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);

    if (debit < 0 || credit < 0) {
      const err = new Error(`Line ${i + 1}: Negative debit or credit is not allowed`);
      err.status = 400;
      throw err;
    }

    if (debit > 0 && credit > 0) {
      const err = new Error(`Line ${i + 1}: A line cannot have both Debit and Credit amounts`);
      err.status = 400;
      throw err;
    }

    if (debit === 0 && credit === 0) {
      const err = new Error(`Line ${i + 1}: A line must have either a Debit or Credit amount`);
      err.status = 400;
      throw err;
    }

    totalDebit += debit;
    totalCredit += credit;

    formattedLines.push({
      accountId,
      partnerId,
      analyticId,
      debit,
      credit,
    });
  }

  if (totalDebit <= 0 || totalCredit <= 0) {
    const err = new Error('Journal entry must have non-zero debits and credits');
    err.status = 400;
    throw err;
  }

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    const err = new Error(
      `Journal entry not balanced: Total Debit (Rs. ${totalDebit.toFixed(2)}) must equal Total Credit (Rs. ${totalCredit.toFixed(2)})`
    );
    err.status = 400;
    throw err;
  }

  return { journal, formattedLines, totalDebit, totalCredit };
}

export async function postJournalEntry({ journalId, reference, date, lines, status = 'POSTED' }) {
  const { formattedLines } = await validateJournalEntryData({ journalId, lines });

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
    const { status, journalId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (journalId) where.journalId = Number(journalId);

    const entries = await prisma.journalEntry.findMany({
      where,
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

export async function getJournalEntry(req, res, next) {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: Number(req.params.id) },
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
    if (!entry) return res.status(404).json({ message: 'Journal entry not found' });
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

export async function createJournalEntry(req, res, next) {
  try {
    const { journalId, reference, date, lines, status } = req.body;
    const entry = await postJournalEntry({
      journalId,
      reference,
      date,
      lines,
      status: status || 'POSTED',
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function postDraftJournalEntry(req, res, next) {
  try {
    const entryId = Number(req.params.id);
    const existing = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { lines: true },
    });

    if (!existing) return res.status(404).json({ message: 'Journal entry not found' });
    if (existing.status === 'POSTED') {
      return res.status(400).json({ message: 'Journal entry is already posted' });
    }

    // Validate lines before posting
    await validateJournalEntryData({
      journalId: existing.journalId,
      lines: existing.lines,
    });

    const updated = await prisma.journalEntry.update({
      where: { id: entryId },
      data: { status: 'POSTED' },
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

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function updateJournalEntry(req, res, next) {
  try {
    const entryId = Number(req.params.id);
    const existing = await prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!existing) return res.status(404).json({ message: 'Journal entry not found' });
    if (existing.status === 'POSTED') {
      return res.status(403).json({
        message: 'Posted journal entries cannot be edited directly. Use entry reversal instead.',
      });
    }

    const { journalId, reference, date, lines, status } = req.body;
    const { formattedLines } = await validateJournalEntryData({
      journalId: journalId || existing.journalId,
      lines,
    });

    // Delete existing lines and recreate with new ones
    await prisma.journalEntryLine.deleteMany({ where: { journalEntryId: entryId } });

    const updated = await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        journalId: journalId ? Number(journalId) : existing.journalId,
        reference: reference !== undefined ? reference : existing.reference,
        date: date ? new Date(date) : existing.date,
        status: status || existing.status,
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

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteJournalEntry(req, res, next) {
  try {
    const entryId = Number(req.params.id);
    const existing = await prisma.journalEntry.findUnique({ where: { id: entryId } });

    if (!existing) return res.status(404).json({ message: 'Journal entry not found' });
    if (existing.status === 'POSTED') {
      return res.status(403).json({
        message: 'Posted journal entries cannot be deleted. Use entry reversal to preserve audit trail.',
      });
    }

    await prisma.journalEntryLine.deleteMany({ where: { journalEntryId: entryId } });
    await prisma.journalEntry.delete({ where: { id: entryId } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function reverseJournalEntry(req, res, next) {
  try {
    const entryId = Number(req.params.id);
    const original = await prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { lines: true, journal: true },
    });

    if (!original) return res.status(404).json({ message: 'Journal entry not found' });
    if (original.status !== 'POSTED') {
      return res.status(400).json({ message: 'Only posted journal entries can be reversed' });
    }

    // Invert debits and credits
    const reversalLines = original.lines.map((l) => ({
      accountId: l.accountId,
      partnerId: l.partnerId,
      analyticId: l.analyticId,
      debit: Number(l.credit),
      credit: Number(l.debit),
    }));

    const reversalRef = original.reference
      ? `REV/${original.reference}`
      : `REV/ENTRY/${original.id}`;

    const reversalEntry = await prisma.journalEntry.create({
      data: {
        journalId: original.journalId,
        reference: reversalRef,
        date: new Date(),
        status: 'POSTED',
        lines: { create: reversalLines },
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

    res.status(201).json(reversalEntry);
  } catch (err) {
    next(err);
  }
}

