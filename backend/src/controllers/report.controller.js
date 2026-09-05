import prisma from '../config/db.js';

// Sums debit/credit per account, grouped by account type.
// This is the core aggregation both Balance Sheet and P&L are built from.
async function getAccountBalances(types, dateTo) {
  const accounts = await prisma.account.findMany({
    where: { type: { in: types }, archived: false },
    include: {
      journalLines: {
        where: dateTo ? { journalEntry: { date: { lte: new Date(dateTo) } } } : undefined,
        include: { journalEntry: true },
      },
    },
  });

  return accounts.map((acc) => {
    const debit = acc.journalLines.reduce((s, l) => s + Number(l.debit), 0);
    const credit = acc.journalLines.reduce((s, l) => s + Number(l.credit), 0);
    // Assets/Expenses are debit-normal; Liabilities/Income/Capital are credit-normal
    const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';
    const balance = isDebitNormal ? debit - credit : credit - debit;
    return { id: acc.id, name: acc.name, type: acc.type, balance };
  });
}

// Balance Sheet: Assets = Liabilities + Capital (+ retained earnings)
export async function balanceSheet(req, res, next) {
  try {
    const { asOf } = req.query;
    const balances = await getAccountBalances(['ASSET', 'LIABILITY', 'CAPITAL'], asOf);

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

// Profit & Loss: Income - Expenses = Net Profit
export async function profitAndLoss(req, res, next) {
  try {
    const { from, to } = req.query;
    const balances = await getAccountBalances(['INCOME', 'EXPENSE'], to);

    const income = balances.filter((b) => b.type === 'INCOME');
    const expenses = balances.filter((b) => b.type === 'EXPENSE');

    const totalIncome = income.reduce((s, a) => s + a.balance, 0);
    const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);

    res.json({
      period: { from, to },
      income,
      expenses,
      netProfit: totalIncome - totalExpenses,
    });
  } catch (err) {
    next(err);
  }
}

// Budget Report: planned vs achieved, per analytic account
export async function budgetReport(req, res, next) {
  try {
    const budgets = await prisma.budget.findMany({ include: { analytic: true } });

    const rows = budgets.map((b) => ({
      name: b.name,
      analytic: b.analytic.name,
      committed: Number(b.committedAmount),
      achieved: Number(b.achievedAmount),
      achievedPercent:
        Number(b.committedAmount) > 0
          ? ((Number(b.achievedAmount) / Number(b.committedAmount)) * 100).toFixed(1)
          : '0.0',
      remaining: Number(b.committedAmount) - Number(b.achievedAmount),
    }));

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
