import api from './axios.js';

// --- Auth ---
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);

export const authApi = {
  getMe: () => api.get('/auth/me'),
  createUser: (data) => api.post('/auth/create-user', data),
  listUsers: () => api.get('/auth/users'),
};

// --- Master Data ---
export const contactsApi = {
  list: (params) => api.get('/contacts', { params }),
  get: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  archive: (id) => api.delete(`/contacts/${id}`),
  unarchive: (id) => api.post(`/contacts/${id}/unarchive`),
};

export const productsApi = {
  list: (params) => api.get('/products', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  archive: (id) => api.delete(`/products/${id}`),
  unarchive: (id) => api.post(`/products/${id}/unarchive`),
};

export const accountsApi = {
  list: () => api.get('/accounts'),
  get: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  archive: (id) => api.delete(`/accounts/${id}`),
};

export const journalsApi = {
  list: () => api.get('/journals'),
  get: (id) => api.get(`/journals/${id}`),
  create: (data) => api.post('/journals', data),
  update: (id, data) => api.put(`/journals/${id}`, data),
};

export const journalEntriesApi = {
  list: (params) => api.get('/journal-entries', { params }),
  get: (id) => api.get(`/journal-entries/${id}`),
  create: (data) => api.post('/journal-entries', data),
  postDraft: (id) => api.post(`/journal-entries/${id}/post`),
  reverse: (id) => api.post(`/journal-entries/${id}/reverse`),
  update: (id, data) => api.put(`/journal-entries/${id}`, data),
  delete: (id) => api.delete(`/journal-entries/${id}`),
};


export const analyticsApi = {
  list: () => api.get('/analytics'),
  get: (id) => api.get(`/analytics/${id}`),
  create: (data) => api.post('/analytics', data),
  update: (id, data) => api.put(`/analytics/${id}`, data),
};

export const budgetsApi = {
  list: () => api.get('/budgets'),
  get: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  confirm: (id) => api.post(`/budgets/${id}/confirm`),
  revise: (id, data) => api.post(`/budgets/${id}/revise`, data),
  cancel: (id) => api.post(`/budgets/${id}/cancel`),
  getTransactions: (id) => api.get(`/budgets/${id}/transactions`),
};

// --- Transaction Flow ---
export const salesApi = {
  listOrders: () => api.get('/sales/orders'),
  createOrder: (data) => api.post('/sales/orders', data),
  confirmOrder: (id) => api.post(`/sales/orders/${id}/confirm`),
  generateInvoice: (id, data) => api.post(`/sales/orders/${id}/invoice`, data),
  listInvoices: (params) => api.get('/sales/invoices', { params }),
  getInvoice: (id) => api.get(`/sales/invoices/${id}`),
};

export const purchaseApi = {
  listOrders: () => api.get('/purchases/orders'),
  createOrder: (data) => api.post('/purchases/orders', data),
  confirmOrder: (id) => api.post(`/purchases/orders/${id}/confirm`),
  convertToBill: (id, data) => api.post(`/purchases/orders/${id}/bill`, data),
  listBills: (params) => api.get('/purchases/bills', { params }),
  getBill: (id) => api.get(`/purchases/bills/${id}`),
};

export const paymentsApi = {
  list: () => api.get('/payments'),
  payInvoice: (data) => api.post('/payments/invoice', data),
  payBill: (data) => api.post('/payments/bill', data),
};

// --- Reports ---
export const reportsApi = {
  balanceSheet: (asOf) => api.get('/reports/balance-sheet', { params: { asOf } }),
  profitLoss: (from, to) => api.get('/reports/profit-loss', { params: { from, to } }),
  budgetReport: () => api.get('/reports/budget'),
  ledgerReport: (params) => api.get('/reports/ledger', { params }),
  journalReport: (params) => api.get('/reports/journal', { params }),
};

