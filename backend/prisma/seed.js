import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=====================================================');
  console.log('🌱 Starting Urban Furniture Demo Dataset Seeding...');
  console.log('=====================================================\n');

  console.log('🧹 Clearing existing demo data...');
  await prisma.user.updateMany({ data: { contactId: null } });
  await prisma.payment.deleteMany();
  await prisma.journalEntryLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.vendorBill.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.analyticAccount.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.product.deleteMany();
  console.log('✅ Cleanup completed.\n');

  console.log('📊 Creating Chart of Accounts...');
  const coaData = [
    { name: 'Cash', type: 'ASSET' },
    { name: 'Bank', type: 'ASSET' },
    { name: 'Debtors', type: 'ASSET' },
    { name: 'Inventory Asset', type: 'ASSET' },
    { name: 'Furniture & Fixtures', type: 'ASSET' },
    { name: 'Office Equipment', type: 'ASSET' },
    { name: 'Prepaid Expenses', type: 'ASSET' },
    { name: 'Creditors', type: 'LIABILITY' },
    { name: 'GST Output Tax Payable', type: 'LIABILITY' },
    { name: 'Outstanding Expenses', type: 'LIABILITY' },
    { name: 'Bank Loan', type: 'LIABILITY' },
    { name: 'TDS Payable', type: 'LIABILITY' },
    { name: 'Capital Account', type: 'CAPITAL' },
    { name: 'Retained Earnings', type: 'CAPITAL' },
    { name: 'Sale Income', type: 'INCOME' },
    { name: 'Service Income', type: 'INCOME' },
    { name: 'Other Income', type: 'INCOME' },
    { name: 'Purchases Expense', type: 'EXPENSE' },
    { name: 'Rent Expense', type: 'EXPENSE' },
    { name: 'Salaries & Wages', type: 'EXPENSE' },
    { name: 'Freight & Logistics Expense', type: 'EXPENSE' },
    { name: 'Utilities & Electricity', type: 'EXPENSE' },
    { name: 'Marketing & Advertising', type: 'EXPENSE' },
    { name: 'Other Expenses', type: 'EXPENSE' },
  ];

  const accounts = {};
  for (const item of coaData) {
    const acc = await prisma.account.create({ data: item });
    accounts[acc.name] = acc;
  }
  console.log('✅ ' + Object.keys(accounts).length + ' Chart of Accounts created.');

  console.log('📓 Creating Journals...');
  const journalsData = [
    { name: 'Sales Journal', type: 'SALES', defaultAccountId: accounts['Sale Income'].id },
    { name: 'Purchase Journal', type: 'PURCHASE', defaultAccountId: accounts['Purchases Expense'].id },
    { name: 'Bank Journal', type: 'BANK', defaultAccountId: accounts['Bank'].id },
    { name: 'Cash Journal', type: 'CASH', defaultAccountId: accounts['Cash'].id },
    { name: 'General Journal', type: 'GENERAL', defaultAccountId: null },
  ];

  const journals = {};
  for (const j of journalsData) {
    const created = await prisma.journal.create({ data: j });
    journals[j.type] = created;
  }
  console.log('✅ ' + Object.keys(journals).length + ' Journals created.');

  console.log('📈 Creating Analytic Accounts...');
  const analyticData = [
    { name: 'Corporate Office Setup', type: 'INCOME' },
    { name: 'Retail Showroom Interior', type: 'INCOME' },
    { name: 'Luxury Villa Furnishing', type: 'INCOME' },
    { name: 'Hospitality & Hotel Lounge', type: 'INCOME' },
    { name: 'Institutional Classroom Setup', type: 'INCOME' },
    { name: 'Raw Material & Lumber Sourcing', type: 'EXPENSE' },
    { name: 'Hardware & Assembly Operations', type: 'EXPENSE' },
    { name: 'Upholstery & Finishing Works', type: 'EXPENSE' },
    { name: 'Warehouse Storage & Logistics', type: 'EXPENSE' },
    { name: 'Showroom Maintenance & Display', type: 'EXPENSE' },
  ];

  const analytics = {};
  for (const a of analyticData) {
    const created = await prisma.analyticAccount.create({ data: a });
    analytics[a.name] = created;
  }
  console.log('✅ ' + Object.keys(analytics).length + ' Analytic Accounts created.');

  console.log('🎯 Creating Budgets...');
  const budgetsData = [
    { name: 'Q3 Corporate Furnishing Sales Budget', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-09-30'), responsiblePerson: 'Administrator', analyticId: analytics['Corporate Office Setup'].id, committedAmount: 500000.0, status: 'CONFIRMED' },
    { name: 'Q3 Retail Interior Project Budget', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-09-30'), responsiblePerson: 'Senior Accountant', analyticId: analytics['Retail Showroom Interior'].id, committedAmount: 350000.0, status: 'CONFIRMED' },
    { name: 'H2 Luxury Villa Furnishing Budget', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-12-31'), responsiblePerson: 'Jay Mehta (CA)', analyticId: analytics['Luxury Villa Furnishing'].id, committedAmount: 750000.0, status: 'CONFIRMED' },
    { name: 'Hospitality Projects Target 2026', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-12-31'), responsiblePerson: 'Administrator', analyticId: analytics['Hospitality & Hotel Lounge'].id, committedAmount: 600000.0, status: 'CONFIRMED' },
    { name: 'Institutional Classrooms Target', periodStart: new Date('2026-07-01'), periodEnd: new Date('2026-09-30'), responsiblePerson: 'Senior Accountant', analyticId: analytics['Institutional Classroom Setup'].id, committedAmount: 400000.0, status: 'DRAFT' },
    { name: 'Lumber & Raw Wood Procurement Cap', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-09-30'), responsiblePerson: 'Senior Accountant', analyticId: analytics['Raw Material & Lumber Sourcing'].id, committedAmount: 300000.0, status: 'CONFIRMED' },
    { name: 'Hardware & Fasteners Expense Cap', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-09-30'), responsiblePerson: 'Jay Mehta (CA)', analyticId: analytics['Hardware & Assembly Operations'].id, committedAmount: 200000.0, status: 'CONFIRMED' },
    { name: 'Upholstery & Fabrics Expense Cap', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-09-30'), responsiblePerson: 'Senior Accountant', analyticId: analytics['Upholstery & Finishing Works'].id, committedAmount: 250000.0, status: 'CONFIRMED' },
    { name: 'Warehouse & Freight Logistics Budget', periodStart: new Date('2026-06-01'), periodEnd: new Date('2026-09-30'), responsiblePerson: 'Administrator', analyticId: analytics['Warehouse Storage & Logistics'].id, committedAmount: 180000.0, status: 'CONFIRMED' },
    { name: 'Showroom Renovation & Display Expense', periodStart: new Date('2026-08-01'), periodEnd: new Date('2026-10-31'), responsiblePerson: 'Jay Mehta (CA)', analyticId: analytics['Showroom Maintenance & Display'].id, committedAmount: 150000.0, status: 'DRAFT' },
  ];

  for (const b of budgetsData) {
    await prisma.budget.create({ data: b });
  }
  console.log('✅ ' + budgetsData.length + ' Budgets created.');

  console.log('👥 Creating Contacts (30 contacts)...');
  const contactsData = [
    { name: 'Apex Corporate Interiors', type: 'CUSTOMER', email: 'contact@apexinteriors.in', mobile: '+91 9820011223', street: '401 Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400051', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150' },
    { name: 'Sharma Living Concepts', type: 'CUSTOMER', email: 'priya.sharma@sharmaliving.com', mobile: '+91 9811223344', street: '22 Defence Colony Market', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110024', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { name: 'Urban Spaces Design Studio', type: 'CUSTOMER', email: 'rohit.verma@urbanspaces.in', mobile: '+91 9845012345', street: '15 Indiranagar 100ft Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560038', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { name: 'Royal Decor Hub', type: 'CUSTOMER', email: 'ananya.desai@royaldecor.com', mobile: '+91 9879054321', street: '88 CG Road, Navrangpura', city: 'Ahmedabad', state: 'Gujarat', country: 'India', pincode: '380009', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { name: 'Zen Workspaces India', type: 'CUSTOMER', email: 'info@zenworkspaces.co.in', mobile: '+91 9717098765', street: 'Plot 45, Cyber City Phase 2', city: 'Gurugram', state: 'Haryana', country: 'India', pincode: '122002', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { name: 'Skyline Architecture & Design', type: 'CUSTOMER', email: 'projects@skylinearch.in', mobile: '+91 9444012399', street: '12 Anna Salai, Mount Road', city: 'Chennai', state: 'Tamil Nadu', country: 'India', pincode: '600002', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    { name: 'Oasis Luxury Living', type: 'CUSTOMER', email: 'oasis.luxury@oasisgroup.in', mobile: '+91 9823055443', street: '7 Koregaon Park North Main Rd', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411001', imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
    { name: 'Metro Heights Properties', type: 'CUSTOMER', email: 'procurement@metroheights.in', mobile: '+91 9831099887', street: '5 Park Street, Chowringhee', city: 'Kolkata', state: 'West Bengal', country: 'India', pincode: '700016', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { name: 'GreenLeaf Coworking Hub', type: 'CUSTOMER', email: 'admin@greenleafcowork.com', mobile: '+91 9988776655', street: '23 Hitec City, Madhapur', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500081', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150' },
    { name: 'TechNova Solutions Pvt Ltd', type: 'CUSTOMER', email: 'facilities@technovasolutions.com', mobile: '+91 9840011998', street: 'Tower C, Electronic City Phase 1', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560100', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150' },
    { name: 'Grand Palace Hotel & Suites', type: 'CUSTOMER', email: 'purchase@grandpalacehotel.in', mobile: '+91 9829033445', street: 'MI Road, Near Ajmeri Gate', city: 'Jaipur', state: 'Rajasthan', country: 'India', pincode: '302001', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150' },
    { name: 'Renaissance Residency Club', type: 'CUSTOMER', email: 'info@renaissanceresidency.com', mobile: '+91 9724011223', street: 'Ring Road, Vesu', city: 'Surat', state: 'Gujarat', country: 'India', pincode: '395007', imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=150' },
    { name: 'NextGen Edutech Classrooms', type: 'CUSTOMER', email: 'admin@nextgenedutech.org', mobile: '+91 9810055443', street: 'Sector 62, Institutional Area', city: 'Noida', state: 'Uttar Pradesh', country: 'India', pincode: '201301', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150' },
    { name: 'Elite Executive Suites', type: 'CUSTOMER', email: 'ops@eliteexecsuites.in', mobile: '+91 9920044556', street: '10 Andheri Kurla Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400059', imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=150' },
    { name: 'TimberCraft Woodworks & Lumber', type: 'VENDOR', email: 'sales@timbercraft.in', mobile: '+91 9849011223', street: '88 Industrial Estate, Peenya', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560058', imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=150' },
    { name: 'SteelEdge Hardware & Frames', type: 'VENDOR', email: 'orders@steeledgehardware.com', mobile: '+91 9822033445', street: '34 GIDC Industrial Area, Makarpura', city: 'Vadodara', state: 'Gujarat', country: 'India', pincode: '390010', imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=150' },
    { name: 'Prime Foam & Upholstery Supplies', type: 'VENDOR', email: 'supply@primefoam.in', mobile: '+91 9818066778', street: '14 Okhla Industrial Area Phase 1', city: 'New Delhi', state: 'Delhi', country: 'India', pincode: '110020', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150' },
    { name: 'Deccan Plywood & Veneers', type: 'VENDOR', email: 'sales@deccanply.com', mobile: '+91 9848099887', street: '55 Sanath Nagar Industrial Zone', city: 'Hyderabad', state: 'Telangana', country: 'India', pincode: '500018', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150' },
    { name: 'Heritage Brass & Metal Fittings', type: 'VENDOR', email: 'contact@heritagebrass.in', mobile: '+91 9828011229', street: '19 Transport Nagar', city: 'Jaipur', state: 'Rajasthan', country: 'India', pincode: '302003', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=150' },
    { name: 'Godavari Timber Mills', type: 'VENDOR', email: 'sales@godavaritimber.com', mobile: '+91 9440055667', street: 'Plot 102, Timber Depot Rd', city: 'Rajahmundry', state: 'Andhra Pradesh', country: 'India', pincode: '533101', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150' },
    { name: 'Nordic Surface Laminates', type: 'VENDOR', email: 'info@nordiclaminates.in', mobile: '+91 9825044332', street: '42 Chhatral GIDC', city: 'Gandhinagar', state: 'Gujarat', country: 'India', pincode: '382729', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=150' },
    { name: 'Krystal Glass & Mirror Works', type: 'VENDOR', email: 'orders@krystalglass.in', mobile: '+91 9820077889', street: '77 Kolshet Road, Thane West', city: 'Thane', state: 'Maharashtra', country: 'India', pincode: '400607', imageUrl: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?w=150' },
    { name: 'Precision Metal Fabrications', type: 'VENDOR', email: 'sales@precisionmetal.co.in', mobile: '+91 9448022334', street: '12 Bommasandra Industrial Area', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560099', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150' },
    { name: 'EcoVeneer & Engineered Woods', type: 'VENDOR', email: 'contact@ecoveneer.in', mobile: '+91 9830066778', street: '9 Kasba Industrial Estate', city: 'Kolkata', state: 'West Bengal', country: 'India', pincode: '700107', imageUrl: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=150' },
    { name: 'Surya Poly-Textiles & Leathers', type: 'VENDOR', email: 'sales@suryatextiles.in', mobile: '+91 9842011998', street: '66 Avinashi Road', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India', pincode: '641018', imageUrl: 'https://images.unsplash.com/photo-1579656592043-a20e25a4aa4b?w=150' },
    { name: 'Royal Castors & Ergonomics Components', type: 'VENDOR', email: 'orders@royalcastors.com', mobile: '+91 9711088776', street: '51 Manesar IMT Sector 5', city: 'Gurugram', state: 'Haryana', country: 'India', pincode: '122050', imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1273?w=150' },
    { name: 'Azure Furniture & Fixtures', type: 'BOTH', email: 'contact@azurefurniture.com', mobile: '+91 9876543210', street: '12 Industrial Area, Kanjurmarg', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400078', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150' },
    { name: 'Woodline Crafts & Exports', type: 'BOTH', email: 'info@woodlinecrafts.in', mobile: '+91 9829088776', street: '104 Boranada Industrial Park', city: 'Jodhpur', state: 'Rajasthan', country: 'India', pincode: '342012', imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=150' },
    { name: 'ComfortCraft Office Solutions', type: 'BOTH', email: 'contact@comfortcraft.in', mobile: '+91 9845099881', street: '28 Rajajinagar Industrial Town', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560010', imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=150' },
    { name: 'Sovereign Interiors & Logistics', type: 'BOTH', email: 'admin@sovereigninteriors.com', mobile: '+91 9820066554', street: '18 Wagle Estate, Road No 16', city: 'Thane', state: 'Maharashtra', country: 'India', pincode: '400604', imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=150' },
  ];

  const createdContacts = [];
  const contactsMap = {};
  for (const c of contactsData) {
    const contact = await prisma.contact.create({ data: c });
    createdContacts.push(contact);
    contactsMap[contact.name] = contact;
  }
  console.log('✅ ' + createdContacts.length + ' Contacts created.');

  console.log('🔐 Creating Users...');
  const adminPwd = await bcrypt.hash('Admin@123!', 10);
  const accPwd = await bcrypt.hash('Acc@123!', 10);
  const caPwd = await bcrypt.hash('Cajay@1234', 10);
  const usrPwd = await bcrypt.hash('User@123!', 10);

  const usersData = [
    { name: 'Administrator', loginId: 'admin', email: 'admin@urbanfurniture.com', password: adminPwd, role: 'ADMIN', contactId: null },
    { name: 'Senior Accountant', loginId: 'accountant', email: 'accountant@urbanfurniture.com', password: accPwd, role: 'ACCOUNTANT', contactId: null },
    { name: 'Jay Mehta (CA)', loginId: 'ca.jay', email: 'jay.mehta@urbanfurniture.com', password: caPwd, role: 'ACCOUNTANT', contactId: null },
    { name: 'Nimesh Pathak (Apex Interiors)', loginId: 'nimesh', email: 'contact@apexinteriors.in', password: usrPwd, role: 'CONTACT_USER', contactId: contactsMap['Apex Corporate Interiors'].id },
    { name: 'Priya Sharma (Sharma Living)', loginId: 'priya', email: 'priya.sharma@sharmaliving.com', password: usrPwd, role: 'CONTACT_USER', contactId: contactsMap['Sharma Living Concepts'].id },
    { name: 'Rohit Verma (Urban Spaces)', loginId: 'rohit', email: 'rohit.verma@urbanspaces.in', password: usrPwd, role: 'CONTACT_USER', contactId: contactsMap['Urban Spaces Design Studio'].id },
    { name: 'Ananya Desai (Royal Decor)', loginId: 'ananya', email: 'ananya.desai@royaldecor.com', password: usrPwd, role: 'CONTACT_USER', contactId: contactsMap['Royal Decor Hub'].id },
  ];

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }
  console.log('✅ ' + usersData.length + ' Users created.');

  console.log('🪑 Creating Products (40 products)...');
  const productsData = [
    { name: 'Ergonomic Mesh Task Chair', type: 'GOODS', category: 'Ergonomic Seating', salesPrice: 8500.0, cost: 4800.0, imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1273?w=200' },
    { name: 'Executive High-Back Leather Chair', type: 'GOODS', category: 'Executive Seating', salesPrice: 22000.0, cost: 13500.0, imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=200' },
    { name: 'Cantilever Conference Room Chair', type: 'GOODS', category: 'Office Seating', salesPrice: 6500.0, cost: 3600.0, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200' },
    { name: 'Solid Teak Wood Dining Chair', type: 'GOODS', category: 'Dining Seating', salesPrice: 4200.0, cost: 2400.0, imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=200' },
    { name: 'Velvet Accent Lounge Armchair', type: 'GOODS', category: 'Living Seating', salesPrice: 16500.0, cost: 9800.0, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' },
    { name: 'Minimalist Wooden Bar Stool', type: 'GOODS', category: 'Bar & Counter', salesPrice: 3800.0, cost: 2100.0, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200' },
    { name: 'Stackable Polypropylene Cafe Chair', type: 'GOODS', category: 'Cafe & Canteen', salesPrice: 1800.0, cost: 950.0, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200' },
    { name: 'Ergonomic Kneeling Posture Stool', type: 'GOODS', category: 'Ergonomic Seating', salesPrice: 7200.0, cost: 4100.0, imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1273?w=200' },
    { name: 'Executive Mahogany Desk (6ft)', type: 'GOODS', category: 'Office Desks', salesPrice: 45000.0, cost: 28000.0, imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200' },
    { name: 'Motorized Height Adjustable Sit-Stand Desk', type: 'GOODS', category: 'Office Desks', salesPrice: 34000.0, cost: 21000.0, imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=200' },
    { name: '4-Person Linear Workstation Pod', type: 'GOODS', category: 'Modular Workstations', salesPrice: 58000.0, cost: 36000.0, imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200' },
    { name: 'Compact Minimalist Study Desk', type: 'GOODS', category: 'Home Office', salesPrice: 9500.0, cost: 5400.0, imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=200' },
    { name: '10-Seater Oak Conference Table', type: 'GOODS', category: 'Meeting & Conference', salesPrice: 72000.0, cost: 44000.0, imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200' },
    { name: 'Round Collaborative Meeting Table', type: 'GOODS', category: 'Meeting & Conference', salesPrice: 18500.0, cost: 11000.0, imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=200' },
    { name: 'Corner L-Shaped Manager Desk', type: 'GOODS', category: 'Office Desks', salesPrice: 28000.0, cost: 17500.0, imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200' },
    { name: 'Italian Leather 3-Seater Sofa', type: 'GOODS', category: 'Living Room', salesPrice: 65000.0, cost: 39000.0, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200' },
    { name: 'L-Shaped Fabric Sectional Sofa', type: 'GOODS', category: 'Living Room', salesPrice: 52000.0, cost: 31000.0, imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200' },
    { name: '2-Seater Reception Waiting Sofa', type: 'GOODS', category: 'Reception Furniture', salesPrice: 24000.0, cost: 14500.0, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200' },
    { name: 'Solid Sheesham Wood Coffee Table', type: 'GOODS', category: 'Living Room', salesPrice: 11500.0, cost: 6800.0, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=200' },
    { name: 'Marble Top Nesting Tables (Set of 2)', type: 'GOODS', category: 'Living Room', salesPrice: 14500.0, cost: 8600.0, imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=200' },
    { name: 'Mid-Century Modern TV Unit (6ft)', type: 'GOODS', category: 'Entertainment', salesPrice: 21000.0, cost: 12500.0, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200' },
    { name: 'Upholstered Ottoman Bench', type: 'GOODS', category: 'Living Room', salesPrice: 8500.0, cost: 4900.0, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200' },
    { name: '6-Seater Solid Teak Dining Table', type: 'GOODS', category: 'Dining', salesPrice: 38000.0, cost: 23000.0, imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200' },
    { name: 'Modern 4-Seater Glass Top Dining Table', type: 'GOODS', category: 'Dining', salesPrice: 22000.0, cost: 13000.0, imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200' },
    { name: 'Wooden Buffet Sideboard Console', type: 'GOODS', category: 'Dining Storage', salesPrice: 29000.0, cost: 17000.0, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200' },
    { name: 'Bar Counter with Glass Racks', type: 'GOODS', category: 'Bar & Dining', salesPrice: 42000.0, cost: 25000.0, imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200' },
    { name: 'Compact Kitchen Island Trolley', type: 'GOODS', category: 'Kitchen', salesPrice: 12500.0, cost: 7200.0, imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=200' },
    { name: 'King Size Engineered Wood Bed with Storage', type: 'GOODS', category: 'Bedroom', salesPrice: 48000.0, cost: 29000.0, imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200' },
    { name: '4-Door Sliding Wardrobe with Mirror', type: 'GOODS', category: 'Storage', salesPrice: 56000.0, cost: 34000.0, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200' },
    { name: '3-Tier Steel Filing Mobile Pedestal', type: 'GOODS', category: 'Office Storage', salesPrice: 5800.0, cost: 3300.0, imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200' },
    { name: 'Industrial Metal & Wood Bookcase', type: 'GOODS', category: 'Storage', salesPrice: 17500.0, cost: 10200.0, imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200' },
    { name: 'Bedside Nightstand Table with Drawer', type: 'GOODS', category: 'Bedroom', salesPrice: 4800.0, cost: 2700.0, imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=200' },
    { name: 'Full Office Interior Design & 3D Layout Consultation', type: 'SERVICE', category: 'Design Services', salesPrice: 35000.0, cost: 12000.0, imageUrl: null },
    { name: 'Turnkey Modular Workstation Assembly & Setup', type: 'SERVICE', category: 'Installation Services', salesPrice: 12000.0, cost: 4500.0, imageUrl: null },
    { name: 'Acoustic Wall Panel Installation Service', type: 'SERVICE', category: 'Installation Services', salesPrice: 18000.0, cost: 7000.0, imageUrl: null },
    { name: 'Annual Office Furniture Maintenance Contract (AMC)', type: 'SERVICE', category: 'Maintenance Services', salesPrice: 25000.0, cost: 8000.0, imageUrl: null },
    { name: 'Wood Polishing & Protective Coating Service', type: 'SERVICE', category: 'Refurbishment Services', salesPrice: 8500.0, cost: 3200.0, imageUrl: null },
    { name: 'Ergonomic Seating Deep Cleaning & Sanitization', type: 'SERVICE', category: 'Maintenance Services', salesPrice: 6000.0, cost: 2000.0, imageUrl: null },
    { name: 'Custom Wood Milling & Edge-Banding Service', type: 'SERVICE', category: 'Customization Services', salesPrice: 15000.0, cost: 6500.0, imageUrl: null },
    { name: 'Site Delivery & White-Glove Installation Service', type: 'SERVICE', category: 'Logistics Services', salesPrice: 4500.0, cost: 1800.0, imageUrl: null },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }
  console.log('✅ ' + createdProducts.length + ' Products created.');

  console.log('🏛️ Posting Opening Capital Entry...');
  await prisma.journalEntry.create({
    data: {
      journalId: journals['GENERAL'].id,
      date: new Date('2026-01-01T09:00:00Z'),
      reference: 'OPEN/2026/001',
      status: 'POSTED',
      lines: {
        create: [
          { accountId: accounts['Bank'].id, partnerId: null, analyticId: null, debit: 2000000.0, credit: 0.0 },
          { accountId: accounts['Cash'].id, partnerId: null, analyticId: null, debit: 300000.0, credit: 0.0 },
          { accountId: accounts['Capital Account'].id, partnerId: null, analyticId: null, debit: 0.0, credit: 2300000.0 },
        ],
      },
    },
  });
  console.log('✅ Opening Entry posted.');

  const customerContacts = createdContacts.filter((c) => c.type === 'CUSTOMER' || c.type === 'BOTH');
  const vendorContacts = createdContacts.filter((c) => c.type === 'VENDOR' || c.type === 'BOTH');
  const goodsProducts = createdProducts.filter((p) => p.type === 'GOODS');
  const allProducts = createdProducts;
  const incomeAnalyticList = Object.values(analytics).filter((a) => a.type === 'INCOME');
  const expenseAnalyticList = Object.values(analytics).filter((a) => a.type === 'EXPENSE');

  const sampleDates = [
    new Date('2026-01-05T10:00:00Z'), new Date('2026-01-12T14:30:00Z'), new Date('2026-01-19T11:15:00Z'),
    new Date('2026-01-26T16:00:00Z'), new Date('2026-02-03T09:30:00Z'), new Date('2026-02-10T14:00:00Z'),
    new Date('2026-02-17T11:45:00Z'), new Date('2026-02-24T15:30:00Z'), new Date('2026-03-04T10:15:00Z'),
    new Date('2026-03-11T13:00:00Z'), new Date('2026-03-18T16:45:00Z'), new Date('2026-03-25T09:00:00Z'),
    new Date('2026-04-01T11:30:00Z'), new Date('2026-04-08T14:15:00Z'), new Date('2026-04-15T10:00:00Z'),
    new Date('2026-04-22T15:45:00Z'), new Date('2026-04-29T13:30:00Z'), new Date('2026-05-06T10:45:00Z'),
    new Date('2026-05-13T14:00:00Z'), new Date('2026-05-20T11:15:00Z'), new Date('2026-05-27T16:30:00Z'),
    new Date('2026-06-03T09:45:00Z'), new Date('2026-06-10T13:15:00Z'), new Date('2026-06-17T10:30:00Z'),
    new Date('2026-06-24T15:00:00Z'), new Date('2026-07-01T11:00:00Z'), new Date('2026-07-08T14:30:00Z'),
    new Date('2026-07-15T10:15:00Z'), new Date('2026-07-22T13:45:00Z'), new Date('2026-07-29T16:00:00Z'),
    new Date('2026-08-05T09:30:00Z'), new Date('2026-08-12T14:00:00Z'), new Date('2026-08-19T11:30:00Z'),
    new Date('2026-08-26T15:15:00Z'), new Date('2026-09-02T10:00:00Z'), new Date('2026-09-06T13:30:00Z'),
    new Date('2026-09-10T11:15:00Z'), new Date('2026-09-13T15:45:00Z'), new Date('2026-09-17T10:30:00Z'),
    new Date('2026-09-20T14:00:00Z'), new Date('2026-09-24T09:45:00Z'), new Date('2026-09-27T13:15:00Z'),
    new Date('2026-01-08T11:00:00Z'), new Date('2026-02-06T14:45:00Z'), new Date('2026-03-06T10:30:00Z'),
    new Date('2026-04-05T15:00:00Z'), new Date('2026-05-08T11:45:00Z'), new Date('2026-06-05T14:15:00Z'),
    new Date('2026-07-04T10:00:00Z'), new Date('2026-08-02T13:30:00Z'), new Date('2026-09-03T16:00:00Z'),
    new Date('2026-01-15T09:15:00Z'), new Date('2026-02-13T14:00:00Z'), new Date('2026-03-13T11:30:00Z'),
    new Date('2026-04-11T15:45:00Z'), new Date('2026-05-15T10:15:00Z'), new Date('2026-06-12T13:45:00Z'),
    new Date('2026-07-11T16:30:00Z'), new Date('2026-08-09T10:00:00Z'), new Date('2026-09-08T14:30:00Z'),
    new Date('2026-01-22T10:00:00Z'), new Date('2026-02-20T14:00:00Z'),
  ];

  const payRatios = [1.0, 1.0, 0.6, 1.0, 0.5, 0.0, 1.0, 0.7, 0.0, 1.0, 1.0, 0.5, 0.0, 1.0, 0.6, 1.0, 0.0, 0.5, 1.0, 0.0];
  const payMethods = ['BANK', 'BANK', 'BANK', 'CASH', 'BANK', 'BANK', 'BANK', 'BANK', 'BANK', 'CASH'];

  console.log('💼 Generating 60 Sales Orders, Invoices, Payments & Journal Entries...');
  let salesOrdersCount = 0, invoicesCount = 0, customerPaymentsCount = 0;

  for (let i = 0; i < 60; i++) {
    const customer = customerContacts[i % customerContacts.length];
    const orderDate = sampleDates[i % sampleDates.length];
    const dueDate = new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const analytic = incomeAnalyticList[i % incomeAnalyticList.length];
    const numLines = (i % 4) + 1;
    const linesData = [];
    let orderTotal = 0;

    for (let l = 0; l < numLines; l++) {
      const prodIndex = (i * 3 + l * 7 + 11) % allProducts.length;
      const product = allProducts[prodIndex];
      const quantity = ((i + l) % 5) + 1;
      const unitPrice = Number(product.salesPrice);
      const taxPercent = l % 2 === 0 ? 18.0 : 12.0;
      orderTotal += unitPrice * quantity * (1 + taxPercent / 100);
      linesData.push({ productId: product.id, quantity, unitPrice, taxPercent, analyticId: analytic.id });
    }
    orderTotal = Math.round(orderTotal * 100) / 100;

    const so = await prisma.salesOrder.create({
      data: { contactId: customer.id, date: orderDate, status: 'INVOICED', createdAt: orderDate, lines: { create: linesData } },
    });
    salesOrdersCount++;

    const payRatio = payRatios[i % payRatios.length];
    const payMethod = payMethods[i % payMethods.length];
    const invStatus = payRatio >= 1.0 ? 'PAID' : payRatio > 0 ? 'PARTIALLY_PAID' : 'UNPAID';
    const invNumber = 'INV/' + String(i + 1).padStart(3, '0');

    const invoice = await prisma.invoice.create({
      data: { invoiceNumber: invNumber, salesOrderId: so.id, invoiceDate: orderDate, dueDate, status: invStatus, totalAmount: orderTotal, createdAt: orderDate },
    });
    invoicesCount++;

    await prisma.journalEntry.create({
      data: {
        journalId: journals['SALES'].id,
        date: orderDate, reference: invNumber, status: 'POSTED', createdAt: orderDate,
        lines: { create: [
          { accountId: accounts['Debtors'].id, partnerId: customer.id, analyticId: analytic.id, debit: orderTotal, credit: 0.0 },
          { accountId: accounts['Sale Income'].id, partnerId: customer.id, analyticId: analytic.id, debit: 0.0, credit: orderTotal },
        ]},
      },
    });

    if (payRatio > 0) {
      const payAmount = Math.round(orderTotal * payRatio * 100) / 100;
      const payDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const payJournal = payMethod === 'CASH' ? journals['CASH'] : journals['BANK'];
      const payAccount = payMethod === 'CASH' ? accounts['Cash'] : accounts['Bank'];
      const payment = await prisma.payment.create({ data: { invoiceId: invoice.id, amount: payAmount, method: payMethod, date: payDate, createdAt: payDate } });
      customerPaymentsCount++;
      await prisma.journalEntry.create({
        data: {
          journalId: payJournal.id, date: payDate,
          reference: 'PAY/CUST/' + payment.id, status: 'POSTED', createdAt: payDate,
          lines: { create: [
            { accountId: payAccount.id, partnerId: customer.id, analyticId: null, debit: payAmount, credit: 0.0 },
            { accountId: accounts['Debtors'].id, partnerId: customer.id, analyticId: null, debit: 0.0, credit: payAmount },
          ]},
        },
      });
    }
  }
  console.log('✅ Sales Flow: ' + salesOrdersCount + ' SOs, ' + invoicesCount + ' Invoices, ' + customerPaymentsCount + ' Payments.');

  console.log('📦 Generating 40 Purchase Orders, Bills, Payments & Journal Entries...');
  let purchaseOrdersCount = 0, vendorBillsCount = 0, vendorPaymentsCount = 0;
  const billRatios = [1.0, 1.0, 0.6, 1.0, 0.5, 0.0, 1.0, 0.7, 0.0, 1.0, 1.0, 0.5, 0.0, 1.0, 0.6, 1.0, 0.0, 0.5, 0.7, 0.0];

  for (let i = 0; i < 40; i++) {
    const vendor = vendorContacts[i % vendorContacts.length];
    const orderDate = sampleDates[i % sampleDates.length];
    const dueDate = new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const analytic = expenseAnalyticList[i % expenseAnalyticList.length];
    const numLines = (i % 3) + 1;
    const linesData = [];
    let orderTotal = 0;

    for (let l = 0; l < numLines; l++) {
      const prodIndex = (i * 2 + l * 9 + 5) % goodsProducts.length;
      const product = goodsProducts[prodIndex];
      const quantity = ((i + l) % 6) + 2;
      const unitCost = Number(product.cost);
      const taxPercent = l % 2 === 0 ? 18.0 : 12.0;
      orderTotal += unitCost * quantity * (1 + taxPercent / 100);
      linesData.push({ productId: product.id, quantity, unitPrice: unitCost, taxPercent, analyticId: analytic.id });
    }
    orderTotal = Math.round(orderTotal * 100) / 100;

    const po = await prisma.purchaseOrder.create({
      data: { contactId: vendor.id, date: orderDate, status: 'INVOICED', createdAt: orderDate, lines: { create: linesData } },
    });
    purchaseOrdersCount++;

    const payRatio = billRatios[i % billRatios.length];
    const payMethod = payMethods[i % payMethods.length];
    const billStatus = payRatio >= 1.0 ? 'PAID' : payRatio > 0 ? 'PARTIALLY_PAID' : 'UNPAID';
    const billNumber = 'BILL/' + String(i + 1).padStart(3, '0');

    const bill = await prisma.vendorBill.create({
      data: { billNumber, purchaseOrderId: po.id, billDate: orderDate, dueDate, status: billStatus, totalAmount: orderTotal, createdAt: orderDate },
    });
    vendorBillsCount++;

    await prisma.journalEntry.create({
      data: {
        journalId: journals['PURCHASE'].id, date: orderDate, reference: billNumber, status: 'POSTED', createdAt: orderDate,
        lines: { create: [
          { accountId: accounts['Purchases Expense'].id, partnerId: vendor.id, analyticId: analytic.id, debit: orderTotal, credit: 0.0 },
          { accountId: accounts['Creditors'].id, partnerId: vendor.id, analyticId: analytic.id, debit: 0.0, credit: orderTotal },
        ]},
      },
    });

    if (payRatio > 0) {
      const payAmount = Math.round(orderTotal * payRatio * 100) / 100;
      const payDate = new Date(orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);
      const payJournal = payMethod === 'CASH' ? journals['CASH'] : journals['BANK'];
      const payAccount = payMethod === 'CASH' ? accounts['Cash'] : accounts['Bank'];
      const payment = await prisma.payment.create({ data: { vendorBillId: bill.id, amount: payAmount, method: payMethod, date: payDate, createdAt: payDate } });
      vendorPaymentsCount++;
      await prisma.journalEntry.create({
        data: {
          journalId: payJournal.id, date: payDate,
          reference: 'PAY/VEND/' + payment.id, status: 'POSTED', createdAt: payDate,
          lines: { create: [
            { accountId: accounts['Creditors'].id, partnerId: vendor.id, analyticId: null, debit: payAmount, credit: 0.0 },
            { accountId: payAccount.id, partnerId: vendor.id, analyticId: null, debit: 0.0, credit: payAmount },
          ]},
        },
      });
    }
  }
  console.log('✅ Purchase Flow: ' + purchaseOrdersCount + ' POs, ' + vendorBillsCount + ' Bills, ' + vendorPaymentsCount + ' Payments.');

  console.log('🏢 Posting Monthly Operating Expense Entries (Jan–Sep 2026)...');
  // Monthly operating expenses — using explicit date arrays to avoid invalid date bugs
  const rentDates   = ['2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01','2026-07-01','2026-08-01','2026-09-01'];
  const salaryDates = ['2026-01-01','2026-02-01','2026-03-01','2026-04-01','2026-05-01','2026-06-01','2026-07-01','2026-08-01','2026-09-01'];
  const freightDates= ['2026-01-15','2026-02-15','2026-03-15','2026-04-15','2026-05-15','2026-06-15','2026-07-15','2026-08-15','2026-09-15'];

  for (let m = 0; m < rentDates.length; m++) {
    const dr = new Date(rentDates[m] + 'T10:00:00Z');
    await prisma.journalEntry.create({
      data: { journalId: journals['BANK'].id, date: dr, reference: 'RENT/2026/' + String(m + 1).padStart(2, '0'), status: 'POSTED', createdAt: dr,
        lines: { create: [{ accountId: accounts['Rent Expense'].id, debit: 85000.0, credit: 0.0 }, { accountId: accounts['Bank'].id, debit: 0.0, credit: 85000.0 }] } },
    });
    const ds = new Date(salaryDates[m] + 'T12:00:00Z');
    await prisma.journalEntry.create({
      data: { journalId: journals['BANK'].id, date: ds, reference: 'SAL/2026/' + String(m + 1).padStart(2, '0'), status: 'POSTED', createdAt: ds,
        lines: { create: [{ accountId: accounts['Salaries & Wages'].id, debit: 320000.0, credit: 0.0 }, { accountId: accounts['Bank'].id, debit: 0.0, credit: 320000.0 }] } },
    });
    const df = new Date(freightDates[m] + 'T10:30:00Z');
    await prisma.journalEntry.create({
      data: { journalId: journals['BANK'].id, date: df, reference: 'FREIGHT/2026/' + String(m + 1).padStart(2, '0'), status: 'POSTED', createdAt: df,
        lines: { create: [{ accountId: accounts['Freight & Logistics Expense'].id, debit: 18000.0, credit: 0.0 }, { accountId: accounts['Bank'].id, debit: 0.0, credit: 18000.0 }] } },
    });
  }

  const utilDates = [['2026-01-05','Q1'],['2026-04-05','Q2'],['2026-07-05','Q3']];
  const mktDates  = [['2026-01-10','Q1'],['2026-04-10','Q2'],['2026-07-10','Q3']];

  for (const [dateStr, q] of utilDates) {
    const du = new Date(dateStr + 'T11:00:00Z');
    await prisma.journalEntry.create({
      data: { journalId: journals['BANK'].id, date: du, reference: 'UTIL/2026/' + q, status: 'POSTED', createdAt: du,
        lines: { create: [{ accountId: accounts['Utilities & Electricity'].id, debit: 28000.0, credit: 0.0 }, { accountId: accounts['Bank'].id, debit: 0.0, credit: 28000.0 }] } },
    });
  }
  for (const [dateStr, q] of mktDates) {
    const dm = new Date(dateStr + 'T14:00:00Z');
    await prisma.journalEntry.create({
      data: { journalId: journals['BANK'].id, date: dm, reference: 'MKT/2026/' + q, status: 'POSTED', createdAt: dm,
        lines: { create: [{ accountId: accounts['Marketing & Advertising'].id, debit: 55000.0, credit: 0.0 }, { accountId: accounts['Bank'].id, debit: 0.0, credit: 55000.0 }] } },
    });
  }
  console.log('✅ Operating expense entries posted (rent, salaries, freight, utilities, marketing).');

  console.log('\n=====================================================');
  console.log('🔍 Running Accounting & Dataset Integrity Verification');
  console.log('=====================================================');

  const counts = {
    users: await prisma.user.count(),
    contacts: await prisma.contact.count(),
    products: await prisma.product.count(),
    accounts: await prisma.account.count(),
    journals: await prisma.journal.count(),
    analyticAccounts: await prisma.analyticAccount.count(),
    budgets: await prisma.budget.count(),
    salesOrders: await prisma.salesOrder.count(),
    salesOrderLines: await prisma.salesOrderLine.count(),
    invoices: await prisma.invoice.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    purchaseOrderLines: await prisma.purchaseOrderLine.count(),
    vendorBills: await prisma.vendorBill.count(),
    payments: await prisma.payment.count(),
    journalEntries: await prisma.journalEntry.count(),
    journalEntryLines: await prisma.journalEntryLine.count(),
  };

  const totalRecords = Object.values(counts).reduce((s, v) => s + v, 0);
  console.log('\n📊 RECORD COUNTS:');
  console.table(counts);
  console.log('✨ Total Business & Master Records in System: ' + totalRecords + '\n');

  const allLines = await prisma.journalEntryLine.findMany();
  const totalDebit = allLines.reduce((sum, l) => sum + Number(l.debit), 0);
  const totalCredit = allLines.reduce((sum, l) => sum + Number(l.credit), 0);
  const diff = Number((totalDebit - totalCredit).toFixed(2));

  console.log('⚖️ GENERAL LEDGER TRIAL BALANCE:');
  console.log('   Total Debit : ₹' + totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
  console.log('   Total Credit: ₹' + totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 }));
  console.log('   Difference  : ₹' + diff.toLocaleString('en-IN', { minimumFractionDigits: 2 }));

  if (Math.abs(diff) > 0.001) {
    throw new Error('❌ Accounting validation failed! Total Debit (' + totalDebit + ') != Total Credit (' + totalCredit + ')');
  }
  console.log('   ✅ Journal Entries are Perfectly Balanced!\n');

  console.log('=====================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('=====================================================\n');
}

main()
  .catch((e) => { console.error('❌ Seeding Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
