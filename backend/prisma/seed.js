import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Chart of Accounts
  const coaData = [
    { name: 'Cash', type: 'ASSET' },
    { name: 'Bank', type: 'ASSET' },
    { name: 'Debtors', type: 'ASSET' },
    { name: 'Creditors', type: 'LIABILITY' },
    { name: 'Sale Income', type: 'INCOME' },
    { name: 'Purchases Expense', type: 'EXPENSE' },
  ];

  const accounts = {};
  for (const item of coaData) {
    const acc = await prisma.account.upsert({
      where: { id: item.id || 0 },
      update: {},
      create: item,
    });
    accounts[acc.name] = acc;
  }
  console.log('Chart of Accounts created.');

  // Find or create accounts helper
  const cashAcc = await prisma.account.findFirst({ where: { name: 'Cash' } });
  const bankAcc = await prisma.account.findFirst({ where: { name: 'Bank' } });
  const salesAcc = await prisma.account.findFirst({ where: { name: 'Sale Income' } });
  const purchaseAcc = await prisma.account.findFirst({ where: { name: 'Purchases Expense' } });
  const debtorsAcc = await prisma.account.findFirst({ where: { name: 'Debtors' } });
  const creditorsAcc = await prisma.account.findFirst({ where: { name: 'Creditors' } });

  // 2. Journals
  const journalsData = [
    { name: 'Sales Journal', type: 'SALES', defaultAccountId: salesAcc.id },
    { name: 'Purchase Journal', type: 'PURCHASE', defaultAccountId: purchaseAcc.id },
    { name: 'Bank Journal', type: 'BANK', defaultAccountId: bankAcc.id },
    { name: 'Cash Journal', type: 'CASH', defaultAccountId: cashAcc.id },
    { name: 'General Journal', type: 'GENERAL', defaultAccountId: null },
  ];

  const journals = {};
  for (const j of journalsData) {
    let existing = await prisma.journal.findFirst({ where: { type: j.type } });
    if (!existing) {
      existing = await prisma.journal.create({ data: j });
    }
    journals[j.type] = existing;
  }
  console.log('Journals created.');

  // 3. Contacts
  const contactsData = [
    {
      name: 'Azure Furniture',
      type: 'VENDOR',
      email: 'contact@azurefurniture.com',
      mobile: '+91 9876543210',
      street: '12 Industrial Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150',
    },
    {
      name: 'Rahul Sharma',
      type: 'VENDOR',
      email: 'rahul@sharmafurniture.com',
      mobile: '+91 9040040404',
      street: '45 Furniture Market',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      name: 'Nimesh Pathak',
      type: 'CUSTOMER',
      email: 'nimesh@example.com',
      mobile: '+91 8080080808',
      street: '78 Commercial Complex',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      pincode: '380001',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      name: 'Open Wood',
      type: 'CUSTOMER',
      email: 'openwood21@example.com',
      mobile: '+91 9123456789',
      street: '9 Sector B',
      city: 'Surat',
      state: 'Gujarat',
      country: 'India',
      pincode: '395001',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  ];

  const createdContacts = {};
  for (const c of contactsData) {
    const contact = await prisma.contact.upsert({
      where: { email: c.email },
      update: c,
      create: c,
    });
    createdContacts[contact.name] = contact;
  }
  console.log('Contacts created.');

  // 4. Products
  const productsData = [
    {
      name: 'Office Chair',
      type: 'GOODS',
      category: 'Furniture',
      salesPrice: 4500.0,
      cost: 2500.0,
      imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1273?w=200',
    },
    {
      name: 'Wooden Table',
      type: 'GOODS',
      category: 'Furniture',
      salesPrice: 12000.0,
      cost: 7500.0,
      imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=200',
    },
    {
      name: 'Wooden Chair',
      type: 'GOODS',
      category: 'Furniture',
      salesPrice: 3500.0,
      cost: 1800.0,
      imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200',
    },
    {
      name: 'Sofa',
      type: 'GOODS',
      category: 'Living',
      salesPrice: 25000.0,
      cost: 15000.0,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200',
    },
    {
      name: 'Dining Table',
      type: 'GOODS',
      category: 'Furniture',
      salesPrice: 18000.0,
      cost: 11000.0,
      imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200',
    },
  ];

  const createdProducts = {};
  for (const p of productsData) {
    let existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      existing = await prisma.product.create({ data: p });
    }
    createdProducts[p.name] = existing;
  }
  console.log('Products created.');

  // 5. Analytics
  const analyticData = [
    { name: 'Furniture Project', type: 'INCOME' },
    { name: 'Office Furniture Setup', type: 'EXPENSE' },
  ];
  const createdAnalytics = {};
  for (const a of analyticData) {
    let existing = await prisma.analyticAccount.findFirst({ where: { name: a.name } });
    if (!existing) {
      existing = await prisma.analyticAccount.create({ data: a });
    }
    createdAnalytics[a.name] = existing;
  }
  console.log('Analytic Accounts created.');

  // 6. Users
  const adminPassword = await bcrypt.hash('Admin@123!', 10);
  const accountantPassword = await bcrypt.hash('Acc@123!', 10);
  const userPassword = await bcrypt.hash('User@123!', 10);

  await prisma.user.upsert({
    where: { loginId: 'admin' },
    update: {},
    create: {
      name: 'Administrator',
      loginId: 'admin',
      email: 'admin@urbanfurniture.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { loginId: 'accountant' },
    update: {},
    create: {
      name: 'Senior Accountant',
      loginId: 'accountant',
      email: 'accountant@urbanfurniture.com',
      password: accountantPassword,
      role: 'ACCOUNTANT',
    },
  });

  if (createdContacts['Nimesh Pathak']) {
    await prisma.user.upsert({
      where: { loginId: 'nimesh' },
      update: {},
      create: {
        name: 'Nimesh Pathak',
        loginId: 'nimesh',
        email: 'nimesh@example.com',
        password: userPassword,
        role: 'CONTACT_USER',
        contactId: createdContacts['Nimesh Pathak'].id,
      },
    });
  }

  console.log('Users created.');

  // 7. Seed Demo Transactions (Purchase & Sales Workflows + Budgets)
  const azure = await prisma.contact.findFirst({ where: { name: 'Azure Furniture' } });
  const nimesh = await prisma.contact.findFirst({ where: { name: 'Nimesh Pathak' } });
  const officeChair = await prisma.product.findFirst({ where: { name: 'Office Chair' } });
  const incomeAnalytic = await prisma.analyticAccount.findFirst({ where: { name: 'Furniture Project' } });
  const expenseAnalytic = await prisma.analyticAccount.findFirst({ where: { name: 'Office Furniture Setup' } });

  // Check if sample PO exists
  const existingPO = await prisma.purchaseOrder.findFirst({ where: { contactId: azure.id } });

  if (!existingPO) {
    // Create Purchase Order for Azure Furniture
    const po = await prisma.purchaseOrder.create({
      data: {
        contactId: azure.id,
        status: 'CONFIRMED',
        lines: {
          create: [
            {
              productId: officeChair.id,
              quantity: 10,
              unitPrice: 2500,
              analyticId: expenseAnalytic.id,
            },
          ],
        },
      },
    });

    // Create Vendor Bill
    const totalBill = 25000;
    const bill = await prisma.vendorBill.create({
      data: {
        billNumber: 'BILL/0001',
        purchaseOrderId: po.id,
        totalAmount: totalBill,
        status: 'PAID',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create Journal Entry for Bill
    await prisma.journalEntry.create({
      data: {
        journalId: journals['PURCHASE'].id,
        reference: `BILL/${bill.id}`,
        status: 'POSTED',
        lines: {
          create: [
            { accountId: purchaseAcc.id, partnerId: azure.id, analyticId: expenseAnalytic.id, debit: 25000, credit: 0 },
            { accountId: creditorsAcc.id, partnerId: azure.id, analyticId: expenseAnalytic.id, debit: 0, credit: 25000 },
          ],
        },
      },
    });

    // Payment for Bill
    const payment = await prisma.payment.create({
      data: {
        vendorBillId: bill.id,
        amount: 25000,
        method: 'BANK',
      },
    });

    // Journal Entry for Payment
    await prisma.journalEntry.create({
      data: {
        journalId: journals['BANK'].id,
        reference: `PAY/${payment.id}`,
        status: 'POSTED',
        lines: {
          create: [
            { accountId: creditorsAcc.id, partnerId: azure.id, debit: 25000, credit: 0 },
            { accountId: bankAcc.id, partnerId: azure.id, debit: 0, credit: 25000 },
          ],
        },
      },
    });

    await prisma.purchaseOrder.update({ where: { id: po.id }, data: { status: 'INVOICED' } });
    console.log('Sample Purchase transaction created.');
  }

  // Check if sample Sales Order exists
  const existingSO = await prisma.salesOrder.findFirst({ where: { contactId: nimesh.id } });
  if (!existingSO) {
    // Create Sales Order for Nimesh Pathak
    const so = await prisma.salesOrder.create({
      data: {
        contactId: nimesh.id,
        status: 'CONFIRMED',
        lines: {
          create: [
            {
              productId: officeChair.id,
              quantity: 5,
              unitPrice: 4500,
              taxPercent: 18,
              analyticId: incomeAnalytic.id,
            },
          ],
        },
      },
    });

    const totalInv = 5 * 4500 * 1.18; // 26550
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV/0001',
        salesOrderId: so.id,
        totalAmount: totalInv,
        status: 'PAID',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Journal Entry for Invoice
    await prisma.journalEntry.create({
      data: {
        journalId: journals['SALES'].id,
        reference: `INV/${invoice.id}`,
        status: 'POSTED',
        lines: {
          create: [
            { accountId: debtorsAcc.id, partnerId: nimesh.id, analyticId: incomeAnalytic.id, debit: totalInv, credit: 0 },
            { accountId: salesAcc.id, partnerId: nimesh.id, analyticId: incomeAnalytic.id, debit: 0, credit: totalInv },
          ],
        },
      },
    });

    // Payment for Invoice
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: totalInv,
        method: 'BANK',
      },
    });

    // Journal Entry for Payment
    await prisma.journalEntry.create({
      data: {
        journalId: journals['BANK'].id,
        reference: `PAY/${payment.id}`,
        status: 'POSTED',
        lines: {
          create: [
            { accountId: bankAcc.id, partnerId: nimesh.id, debit: totalInv, credit: 0 },
            { accountId: debtorsAcc.id, partnerId: nimesh.id, debit: 0, credit: totalInv },
          ],
        },
      },
    });

    await prisma.salesOrder.update({ where: { id: so.id }, data: { status: 'INVOICED' } });
    console.log('Sample Sales transaction created.');
  }

  // 8. Seed Budget
  const existingBudget = await prisma.budget.findFirst({ where: { analyticId: incomeAnalytic.id } });
  if (!existingBudget) {
    await prisma.budget.create({
      data: {
        name: 'Q3 Furniture Sales Budget',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-12-31'),
        responsiblePerson: 'Administrator',
        analyticId: incomeAnalytic.id,
        committedAmount: 100000,
        status: 'CONFIRMED',
      },
    });

    await prisma.budget.create({
      data: {
        name: 'Office Setup Expense Budget',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-12-31'),
        responsiblePerson: 'Senior Accountant',
        analyticId: expenseAnalytic.id,
        committedAmount: 50000,
        status: 'CONFIRMED',
      },
    });
    console.log('Sample Budgets created.');
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
