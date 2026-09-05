import prisma from '../config/db.js';
import { computeBudgetAchieved } from './budget.controller.js';

async function getAccountBalances(types, dateFrom, dateTo) {
  const whereLines = {};
  if (dateFrom || dateTo) {
    whereLines.journalEntry = {
      date: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      },
    };
  }

  const accounts = await prisma.account.findMany({
    where: { type: { in: types }, archived: false },
    include: {
      journalLines: {
        where: whereLines,
        include: { journalEntry: true },
      },
    },
  });

  return accounts.map((acc) => {
    const debit = acc.journalLines.reduce((s, l) => s + Number(l.debit), 0);
    const credit = acc.journalLines.reduce((s, l) => s + Number(l.credit), 0);
    const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';
    const balance = isDebitNormal ? debit - credit : credit - debit;
    return { id: acc.id, name: acc.name, type: acc.type, debit, credit, balance };
  });
}

export async function balanceSheet(req, res, next) {
  try {
    const { asOf } = req.query;
    const balances = await getAccountBalances(['ASSET', 'LIABILITY', 'CAPITAL'], null, asOf);

    const assets = balances.filter((b) => b.type === 'ASSET');
    const liabilities = balances.filter((b) => b.type === 'LIABILITY');
    const capital = balances.filter((b) => b.type === 'CAPITAL');

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
    const totalCapital = capital.reduce((s, a) => s + a.balance, 0);

    res.json({
      asOf: asOf || new Date().toISOString(),
      assets,
      liabilities,
      capital,
      totals: { totalAssets, totalLiabilities, totalCapital },
    });
  } catch (err) {
    next(err);
  }
}

export async function profitAndLoss(req, res, next) {
  try {
    const { from, to } = req.query;
    const balances = await getAccountBalances(['INCOME', 'EXPENSE'], from, to);

    const income = balances.filter((b) => b.type === 'INCOME');
    const expenses = balances.filter((b) => b.type === 'EXPENSE');

    const totalIncome = income.reduce((s, a) => s + a.balance, 0);
    const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);

    res.json({
      period: { from, to },
      income,
      expenses,
      totals: { totalIncome, totalExpenses },
      netProfit: totalIncome - totalExpenses,
    });
  } catch (err) {
    next(err);
  }
}

export async function budgetReport(req, res, next) {
  try {
    const budgets = await prisma.budget.findMany({
      include: { analytic: true, revisedFrom: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = await Promise.all(
      budgets.map(async (b) => {
        const achieved = await computeBudgetAchieved(b);
        const committed = Number(b.committedAmount);
        const achievedNum = Number(achieved);
        const achievedPercent = committed > 0 ? ((achievedNum / committed) * 100).toFixed(1) : '0.0';

        return {
          id: b.id,
          name: b.name,
          analytic: b.analytic.name,
          analyticType: b.analytic.type,
          periodStart: b.periodStart,
          periodEnd: b.periodEnd,
          responsiblePerson: b.responsiblePerson,
          committed,
          achieved: achievedNum,
          achievedPercent: Number(achievedPercent),
          remaining: Math.max(0, committed - achievedNum),
          status: b.status,
        };
      })
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function ledgerReport(req, res, next) {
  try {
    const { accountId, from, to } = req.query;

    const whereEntry = { status: 'POSTED' };
    if (from || to) {
      whereEntry.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const whereLines = {
      journalEntry: whereEntry,
    };
    if (accountId) {
      whereLines.accountId = Number(accountId);
    }

    const lines = await prisma.journalEntryLine.findMany({
      where: whereLines,
      include: {
        account: true,
        partner: true,
        journalEntry: { include: { journal: true } },
      },
      orderBy: { journalEntry: { date: 'asc' } },
    });

    let runningBalance = 0;
    const items = lines.map((l) => {
      const isDebitNormal = l.account.type === 'ASSET' || l.account.type === 'EXPENSE';
      const dr = Number(l.debit);
      const cr = Number(l.credit);
      if (isDebitNormal) {
        runningBalance += dr - cr;
      } else {
        runningBalance += cr - dr;
      }

      return {
        id: l.id,
        date: l.journalEntry.date,
        reference: l.journalEntry.reference,
        journal: l.journalEntry.journal.name,
        account: l.account.name,
        accountId: l.accountId,
        accountType: l.account.type,
        partner: l.partner ? l.partner.name : null,
        debit: dr,
        credit: cr,
        runningBalance,
      };
    });

    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function journalReport(req, res, next) {
  try {
    const { journalId, from, to } = req.query;
    const where = { status: 'POSTED' };

    if (journalId) {
      where.journalId = Number(journalId);
    }
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      include: {
        journal: true,
        lines: {
          include: {
            account: true,
            partner: true,
            analytic: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(entries);
  } catch (err) {
    next(err);
  }
}

