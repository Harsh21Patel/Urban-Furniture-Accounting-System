import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';
import productRoutes from './routes/product.routes.js';
import accountRoutes from './routes/account.routes.js';
import journalRoutes from './routes/journal.routes.js';
import journalEntryRoutes from './routes/journalEntry.routes.js';
import salesRoutes from './routes/sales.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import analyticRoutes from './routes/analytic.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import reportRoutes from './routes/report.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/journal-entries', journalEntryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
