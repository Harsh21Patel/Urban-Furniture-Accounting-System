import api from './axios.js';

// --- Auth ---
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);

// --- Master Data ---
export const contactsApi = {
  list: () => api.get('/contacts'),
  get: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  archive: (id) => api.delete(`/contacts/${id}`),
};

export const productsApi = {
  list: () => api.get('/products'),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
};

export const accountsApi = {
  list: () => api.get('/accounts'),
  create: (data) => api.post('/accounts', data),
};

export const journalsApi = {
  list: () => api.get('/journals'),
  create: (data) => api.post('/journals', data),
};

export const journalEntriesApi = {
  list: () => api.get('/journal-entries'),
  create: (data) => api.post('/journal-entries', data),
};

export const analyticsApi = {
  list: () => api.get('/analytics'),
  create: (data) => api.post('/analytics', data),
};

export const budgetsApi = {
  list: () => api.get('/budgets'),
  create: (data) => api.post('/budgets', data),
};

// --- Transaction Flow ---
export const salesApi = {
  listOrders: () => api.get('/sales/orders'),
  createOrder: (data) => api.post('/sales/orders', data),
  confirmOrder: (id) => api.post(`/sales/orders/${id}/confirm`),
  generateInvoice: (id, data) => api.post(`/sales/orders/${id}/invoice`, data),
};

export const purchaseApi = {
  listOrders: () => api.get('/purchases/orders'),
  createOrder: (data) => api.post('/purchases/orders', data),
  convertToBill: (id, data) => api.post(`/purchases/orders/${id}/bill`, data),
};

export const paymentsApi = {
  payInvoice: (data) => api.post('/payments/invoice', data),
  payBill: (data) => api.post('/payments/bill', data),
};

// --- Reports ---
export const reportsApi = {
  balanceSheet: (asOf) => api.get('/reports/balance-sheet', { params: { asOf } }),
  profitLoss: (from, to) => api.get('/reports/profit-loss', { params: { from, to } }),
  budgetReport: () => api.get('/reports/budget'),
};
