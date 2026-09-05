import prisma from '../config/db.js';
import { getDateRangeFilter } from '../utils/dateUtils.js';

export async function computeBudgetAchieved(budget) {
  const { analyticId, periodStart, periodEnd } = budget;

  const analytic = await prisma.analyticAccount.findUnique({
    where: { id: Number(analyticId) },
  });

  if (!analytic) return 0;

  const dateFilter = getDateRangeFilter(periodStart, periodEnd);

  const lines = await prisma.journalEntryLine.findMany({
    where: {
      analyticId: Number(analyticId),
      journalEntry: {
        status: 'POSTED',
        ...(dateFilter ? { date: dateFilter } : {}),
      },
    },
    include: {
      account: true,
    },
  });

  if (analytic.type === 'INCOME') {
    return lines.reduce((sum, l) => {
      if (l.account.type === 'INCOME') {
        return sum + (Number(l.credit) - Number(l.debit));
      }
      return sum + Number(l.credit);
    }, 0);
  } else {
    return lines.reduce((sum, l) => {
      if (l.account.type === 'EXPENSE') {
        return sum + (Number(l.debit) - Number(l.credit));
      }
      return sum + Number(l.debit);
    }, 0);
  }
}


export async function listBudgets(req, res, next) {
  try {
    const rawBudgets = await prisma.budget.findMany({
      include: {
        analytic: true,
        revisedFrom: true,
        revisions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const budgets = await Promise.all(
      rawBudgets.map(async (b) => {
        const achievedAmount = await computeBudgetAchieved(b);
        const committed = Number(b.committedAmount);
        const achieved = Number(achievedAmount);
        const achievedPercent = committed > 0 ? ((achieved / committed) * 100).toFixed(1) : '0.0';
        const remaining = Math.max(0, committed - achieved);

        return {
          ...b,
          committedAmount: committed,
          achievedAmount: achieved,
          achievedPercent: Number(achievedPercent),
          remainingAmount: remaining,
        };
      })
    );

    res.json(budgets);
  } catch (err) {
    next(err);
  }
}

export async function getBudget(req, res, next) {
  try {
    const item = await prisma.budget.findUnique({
      where: { id: Number(req.params.id) },
      include: { analytic: true, revisedFrom: true, revisions: true },
    });
    if (!item) return res.status(404).json({ message: 'Budget not found' });

    const achievedAmount = await computeBudgetAchieved(item);
    const committed = Number(item.committedAmount);
    const achieved = Number(achievedAmount);

    res.json({
      ...item,
      committedAmount: committed,
      achievedAmount: achieved,
      achievedPercent: committed > 0 ? Number(((achieved / committed) * 100).toFixed(1)) : 0,
      remainingAmount: Math.max(0, committed - achieved),
    });
  } catch (err) {
    next(err);
  }
}

export async function createBudget(req, res, next) {
  try {
    const { name, periodStart, periodEnd, responsiblePerson, analyticId, committedAmount } = req.body;

    const item = await prisma.budget.create({
      data: {
        name,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        responsiblePerson: responsiblePerson || null,
        analyticId: Number(analyticId),
        committedAmount: Number(committedAmount),
        status: 'DRAFT',
      },
      include: { analytic: true },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function confirmBudget(req, res, next) {
  try {
    const item = await prisma.budget.update({
      where: { id: Number(req.params.id) },
      data: { status: 'CONFIRMED' },
      include: { analytic: true },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function reviseBudget(req, res, next) {
  try {
    const oldBudgetId = Number(req.params.id);
    const oldBudget = await prisma.budget.findUnique({ where: { id: oldBudgetId } });
    if (!oldBudget) return res.status(404).json({ message: 'Original budget not found' });

    const newCommitted = req.body.committedAmount !== undefined ? Number(req.body.committedAmount) : Number(oldBudget.committedAmount);

    // Update old budget status to REVISED
    await prisma.budget.update({
      where: { id: oldBudgetId },
      data: { status: 'REVISED' },
    });

    // Create new budget entry with status CONFIRMED and link to old budget
    const newName = oldBudget.name.endsWith('Revised')
      ? oldBudget.name
      : `${oldBudget.name} Revised`;

    const newBudget = await prisma.budget.create({
      data: {
        name: newName,
        periodStart: oldBudget.periodStart,
        periodEnd: oldBudget.periodEnd,
        responsiblePerson: oldBudget.responsiblePerson,
        analyticId: oldBudget.analyticId,
        committedAmount: newCommitted,
        status: 'CONFIRMED',
        revisedFromId: oldBudgetId,
      },
      include: { analytic: true, revisedFrom: true },
    });

    res.status(201).json(newBudget);
  } catch (err) {
    next(err);
  }
}

export async function cancelBudget(req, res, next) {
  try {
    const item = await prisma.budget.update({
      where: { id: Number(req.params.id) },
      data: { status: 'CANCELLED' },
      include: { analytic: true },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function getBudgetTransactions(req, res, next) {
  try {
    const budgetId = Number(req.params.id);
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { analytic: true },
    });

    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    const dateFilter = getDateRangeFilter(budget.periodStart, budget.periodEnd);

    const lines = await prisma.journalEntryLine.findMany({
      where: {
        analyticId: budget.analyticId,
        journalEntry: {
          status: 'POSTED',
          ...(dateFilter ? { date: dateFilter } : {}),
        },
      },
      include: {
        partner: true,
        account: true,
        journalEntry: { include: { journal: true } },
      },
      orderBy: { journalEntry: { date: 'desc' } },
    });

    const transactions = lines.map((l) => {
      const isIncome = budget.analytic.type === 'INCOME';
      const amount = isIncome
        ? (l.account.type === 'INCOME' ? Number(l.credit) - Number(l.debit) : Number(l.credit))
        : (l.account.type === 'EXPENSE' ? Number(l.debit) - Number(l.credit) : Number(l.debit));

      let type = 'Journal Line';
      if (l.journalEntry.journal.type === 'SALES') type = 'Customer Invoice';
      else if (l.journalEntry.journal.type === 'PURCHASE') type = 'Vendor Bill';
      else if (l.journalEntry.journal.type === 'BANK' || l.journalEntry.journal.type === 'CASH') type = 'Payment';

      return {
        type,
        id: l.id,
        reference: l.journalEntry.reference || `ENTRY/${l.journalEntry.id}`,
        partner: l.partner ? l.partner.name : '-',
        account: l.account.name,
        date: l.journalEntry.date,
        totalAmount: amount,
        status: l.journalEntry.status,
      };
    });

    res.json(transactions);
  } catch (err) {
    next(err);
  }
}

