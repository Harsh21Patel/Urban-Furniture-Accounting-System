import prisma from '../config/db.js';
import { computeBudgetAchieved } from './budget.controller.js';
import { getDateRangeFilter, getAsOfFilter, startOfDay } from '../utils/dateUtils.js';

async function getAccountBalances(types, dateFrom, dateTo, asOf) {
  const whereJournalEntry = { status: 'POSTED' };

  if (asOf) {
    const asOfFilter = getAsOfFilter(asOf);
    if (asOfFilter) whereJournalEntry.date = asOfFilter;
  } else if (dateFrom || dateTo) {
    const dateRangeFilter = getDateRangeFilter(dateFrom, dateTo);
    if (dateRangeFilter) whereJournalEntry.date = dateRangeFilter;
  }

  const accounts = await prisma.account.findMany({
    where: { type: { in: types }, archived: false },
    include: {
      journalLines: {
        where: { journalEntry: whereJournalEntry },
        include: { journalEntry: true },
      },
    },
    orderBy: { id: 'asc' },
  });

  return accounts.map((acc) => {
    const debit = acc.journalLines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const credit = acc.journalLines.reduce((s, l) => s + Number(l.credit || 0), 0);
    const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';
    const balance = isDebitNormal ? debit - credit : credit - debit;
    return { id: acc.id, name: acc.name, type: acc.type, debit, credit, balance };
  });
}

export async function balanceSheet(req, res, next) {
  try {
    const { asOf } = req.query;
    // Query ASSET, LIABILITY, CAPITAL, INCOME, EXPENSE to compute net income for equity reconciliation
    const balances = await getAccountBalances(['ASSET', 'LIABILITY', 'CAPITAL', 'INCOME', 'EXPENSE'], null, null, asOf);

    const assets = balances.filter((b) => b.type === 'ASSET');
    const liabilities = balances.filter((b) => b.type === 'LIABILITY');
    const capital = balances.filter((b) => b.type === 'CAPITAL');
    const income = balances.filter((b) => b.type === 'INCOME');
    const expenses = balances.filter((b) => b.type === 'EXPENSE');

    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
    const totalCapital = capital.reduce((s, a) => s + a.balance, 0);
    const totalIncome = income.reduce((s, a) => s + a.balance, 0);
    const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);

    // Current period net income (Retained Earnings)
    const netIncome = totalIncome - totalExpenses;
    const totalEquity = totalCapital + netIncome;
    const totalLiabilitiesAndCapital = totalLiabilities + totalEquity;
    const difference = Number((totalAssets - totalLiabilitiesAndCapital).toFixed(2));
    const isBalanced = Math.abs(difference) < 0.01;

    res.json({
      asOf: asOf || new Date().toISOString().split('T')[0],
      assets,
      liabilities,
      capital,
      netIncome,
      totals: {
        totalAssets,
        totalLiabilities,
        totalCapital,
        netIncome,
        totalEquity,
        totalLiabilitiesAndCapital,
        difference,
        isBalanced,
      },
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
    const netProfit = totalIncome - totalExpenses;

    res.json({
      period: { from: from || null, to: to || null },
      income,
      expenses,
      totals: { totalIncome, totalExpenses },
      netProfit,
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
    const dateFilter = getDateRangeFilter(from, to);

    if (accountId) {
      const accId = Number(accountId);
      const account = await prisma.account.findUnique({ where: { id: accId } });
      if (!account) return res.status(404).json({ message: 'Account not found' });

      const isDebitNormal = account.type === 'ASSET' || account.type === 'EXPENSE';

      // 1. Calculate opening balance (all POSTED transactions prior to 'from' date)
      let openingBalance = 0;
      if (from) {
        const sDate = startOfDay(from);
        if (sDate) {
          const priorLines = await prisma.journalEntryLine.findMany({
            where: {
              accountId: accId,
              journalEntry: {
                status: 'POSTED',
                date: { lt: sDate },
              },
            },
          });
          const priorDr = priorLines.reduce((s, l) => s + Number(l.debit || 0), 0);
          const priorCr = priorLines.reduce((s, l) => s + Number(l.credit || 0), 0);
          openingBalance = isDebitNormal ? priorDr - priorCr : priorCr - priorDr;
        }
      }

      // 2. Fetch lines within period
      const lines = await prisma.journalEntryLine.findMany({
        where: {
          accountId: accId,
          journalEntry: {
            status: 'POSTED',
            ...(dateFilter ? { date: dateFilter } : {}),
          },
        },
        include: {
          account: true,
          partner: true,
          journalEntry: { include: { journal: true } },
        },
        orderBy: [{ journalEntry: { date: 'asc' } }, { id: 'asc' }],
      });

      let running = openingBalance;
      const items = lines.map((l) => {
        const dr = Number(l.debit || 0);
        const cr = Number(l.credit || 0);
        if (isDebitNormal) {
          running += dr - cr;
        } else {
          running += cr - dr;
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
          runningBalance: running,
        };
      });

      res.json({
        account: { id: account.id, name: account.name, type: account.type },
        openingBalance,
        closingBalance: running,
        lines: items,
      });
    } else {
      // All Accounts: calculate running balance per account independently
      const accounts = await prisma.account.findMany({
        where: { archived: false },
        orderBy: { id: 'asc' },
      });

      const accountGroups = [];
      const allLinesFlat = [];

      for (const acc of accounts) {
        const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';

        let openingBalance = 0;
        if (from) {
          const sDate = startOfDay(from);
          if (sDate) {
            const priorLines = await prisma.journalEntryLine.findMany({
              where: {
                accountId: acc.id,
                journalEntry: {
                  status: 'POSTED',
                  date: { lt: sDate },
                },
              },
            });
            const priorDr = priorLines.reduce((s, l) => s + Number(l.debit || 0), 0);
            const priorCr = priorLines.reduce((s, l) => s + Number(l.credit || 0), 0);
            openingBalance = isDebitNormal ? priorDr - priorCr : priorCr - priorDr;
          }
        }

        const lines = await prisma.journalEntryLine.findMany({
          where: {
            accountId: acc.id,
            journalEntry: {
              status: 'POSTED',
              ...(dateFilter ? { date: dateFilter } : {}),
            },
          },
          include: {
            account: true,
            partner: true,
            journalEntry: { include: { journal: true } },
          },
          orderBy: [{ journalEntry: { date: 'asc' } }, { id: 'asc' }],
        });

        let running = openingBalance;
        let totalDebit = 0;
        let totalCredit = 0;

        const mappedLines = lines.map((l) => {
          const dr = Number(l.debit || 0);
          const cr = Number(l.credit || 0);
          totalDebit += dr;
          totalCredit += cr;
          if (isDebitNormal) {
            running += dr - cr;
          } else {
            running += cr - dr;
          }

          const lineObj = {
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
            runningBalance: running,
          };
          allLinesFlat.push(lineObj);
          return lineObj;
        });

        if (lines.length > 0 || Math.abs(openingBalance) > 0.01) {
          accountGroups.push({
            account: { id: acc.id, name: acc.name, type: acc.type },
            openingBalance,
            closingBalance: running,
            totalDebit,
            totalCredit,
            lines: mappedLines,
          });
        }
      }

      res.json({
        accountGroups,
        lines: allLinesFlat,
      });
    }
  } catch (err) {
    next(err);
  }
}

export async function journalReport(req, res, next) {
  try {
    const { journalId, from, to } = req.query;
    const dateFilter = getDateRangeFilter(from, to);
    const where = { status: 'POSTED' };

    if (journalId) {
      where.journalId = Number(journalId);
    }
    if (dateFilter) {
      where.date = dateFilter;
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


