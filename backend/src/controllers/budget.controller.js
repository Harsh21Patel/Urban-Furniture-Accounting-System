import prisma from '../config/db.js';

export async function computeBudgetAchieved(budget) {
  const { analyticId, periodStart, periodEnd } = budget;

  const analytic = await prisma.analyticAccount.findUnique({
    where: { id: Number(analyticId) },
  });

  if (!analytic) return 0;

  if (analytic.type === 'INCOME') {
    // Sum Sales Invoices for sales orders matching analyticId and created between periodStart and periodEnd
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: { gte: new Date(periodStart), lte: new Date(periodEnd) },
        salesOrder: {
          lines: { some: { analyticId: Number(analyticId) } },
        },
      },
    });
    return invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
  } else {
    // Sum Vendor Bills for purchase orders matching analyticId and created between periodStart and periodEnd
    const bills = await prisma.vendorBill.findMany({
      where: {
        createdAt: { gte: new Date(periodStart), lte: new Date(periodEnd) },
        purchaseOrder: {
          lines: { some: { analyticId: Number(analyticId) } },
        },
      },
    });
    return bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
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

    if (budget.analytic.type === 'INCOME') {
      const invoices = await prisma.invoice.findMany({
        where: {
          createdAt: { gte: new Date(budget.periodStart), lte: new Date(budget.periodEnd) },
          salesOrder: { lines: { some: { analyticId: budget.analyticId } } },
        },
        include: { salesOrder: { include: { contact: true } } },
      });
      res.json(
        invoices.map((inv) => ({
          type: 'Customer Invoice',
          id: inv.id,
          reference: `INV/${inv.id}`,
          partner: inv.salesOrder.contact.name,
          date: inv.createdAt,
          totalAmount: Number(inv.totalAmount),
          status: inv.status,
        }))
      );
    } else {
      const bills = await prisma.vendorBill.findMany({
        where: {
          createdAt: { gte: new Date(budget.periodStart), lte: new Date(budget.periodEnd) },
          purchaseOrder: { lines: { some: { analyticId: budget.analyticId } } },
        },
        include: { purchaseOrder: { include: { contact: true } } },
      });
      res.json(
        bills.map((b) => ({
          type: 'Vendor Bill',
          id: b.id,
          reference: `BILL/${b.id}`,
          partner: b.purchaseOrder.contact.name,
          date: b.createdAt,
          totalAmount: Number(b.totalAmount),
          status: b.status,
        }))
      );
    }
  } catch (err) {
    next(err);
  }
}
