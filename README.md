# Urban Furniture — Double-Entry Accounting & ERP System

[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20PostgreSQL-blue.svg)](https://github.com/)
[![ORM](https://img.shields.io/badge/ORM-Prisma-0c344b.svg)](https://www.prisma.io/)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20TailwindCSS-646cff.svg)](https://vitejs.dev/)

A modern, full-stack ERP and **Double-Entry Accounting System** built specifically for furniture manufacturing, retail, and corporate interior enterprises. Featuring role-based access control, automated ledger postings, sales/purchase lifecycle workflows, analytic accounting, budget tracking, and real-time financial reporting.

---

## 🚀 Key Features & Modules

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Multi-Role Security**: Supports `ADMIN`, `ACCOUNTANT`, and `CONTACT_USER` roles.
- **Admin User Provisioning**: Admins can register internal team members or link user accounts directly to specific contacts.
- **Protected Client Portal**: Dedicated portal for external clients/vendors to review their invoices, bills, and payments securely.

### 🗂️ 2. Master Data Management
- **Contacts Directory**: Unified portal for Customers, Vendors, and dual-category contacts (`BOTH`). Includes address management, tax details, and soft-archiving.
- **Product & Service Catalog**: Manage physical furniture goods and professional services (e.g., custom wood milling, 3D design layout, delivery). Tracks cost price, sales price, categories, and image URLs.
- **Chart of Accounts (COA)**: Standardized double-entry accounts structured into `ASSET`, `LIABILITY`, `INCOME`, `EXPENSE`, and `CAPITAL`.
- **Journals Configuration**: Custom journals for `SALES`, `PURCHASE`, `BANK`, `CASH`, and `GENERAL` transactions linked to default ledger accounts.

### 🔄 3. Complete Business Transaction Lifecycles
- **Sales Flow (Order to Cash)**:
  - Create & manage Sales Orders (`DRAFT` → `CONFIRMED` → `INVOICED`).
  - Generate Sales Invoices with automatic **Sales Journal** double-entry postings (`Debtors Dr.` / `Sales Income Cr.`).
  - Record Customer Payments with real-time status updates (`UNPAID`, `PARTIALLY_PAID`, `PAID`) and **Bank/Cash Journal** entries.
- **Purchase Flow (Procure to Pay)**:
  - Issue Purchase Orders for raw materials, lumber, hardware, and upholstery.
  - Convert POs into Vendor Bills with automatic **Purchase Journal** ledger postings (`Purchases Expense Dr.` / `Creditors Cr.`).
  - Process Vendor Payments against bills.

### 📊 4. Financial Analytics & Budgeting
- **Analytic Accounting**: Allocate income and expense lines to granular analytic accounts (e.g., *Corporate Office Setup*, *Luxury Villa Furnishing*, *Raw Material Sourcing*).
- **Budget Management**: Set committed budget caps per analytic account for custom date periods.
- **Variance Tracking**: Real-time tracking of committed vs. achieved amounts with budget revision history and approval status (`DRAFT`, `CONFIRMED`, `REVISED`).

### 📈 5. Real-Time Financial Reporting
- **Balance Sheet**: Comprehensive summary of company Assets vs. Liabilities and Equity/Capital.
- **Profit & Loss (P&L)**: Revenue vs. Operating Expenses breakdown with net profit calculation.
- **Budget Performance Report**: Utilization breakdown highlighting target vs. actual spending.
- **General Ledger Report**: Filterable account-wise transaction history with running balances.
- **Journal Report**: Sequential log of all debit/credit postings across journals.
- **Printable Invoices**: Printable invoice & document letterhead templates.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide Icons, React Hook Form, Axios |
| **Backend** | Node.js, Express.js, Prisma ORM v5, JWT Authentication, bcryptjs, Express Validator |
| **Database** | PostgreSQL |
| **Tooling** | Nodemon, Prisma Studio, Dotenv |

---

## 📁 Project Structure

```text
Urban/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL Schema & Data Models
│   │   └── seed.js         # Comprehensive demo dataset generator
│   ├── src/
│   │   ├── config/         # Database and app configurations
│   │   ├── controllers/    # Route controllers & business logic
│   │   ├── middleware/     # Auth, JWT, and validation middleware
│   │   ├── routes/         # Express API endpoints
│   │   ├── utils/          # Helper functions & accounting engines
│   │   ├── app.js          # Express app initialization
│   │   └── server.js       # Entry point server runner
│   ├── .env.example        # Backend environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Sidebar, Navbar, PrintLetterhead)
│   │   ├── pages/          # Feature pages (Dashboard, Sales, Purchases, Reports, etc.)
│   │   ├── routes/         # Protected routes & role wrappers
│   │   ├── utils/          # API Axios instance & helpers
│   │   ├── App.jsx         # Main React routing component
│   │   └── main.jsx        # App mounting
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: `v18+` installed
- **PostgreSQL**: Running instance on `localhost:5432`

---

### 1️⃣ Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/urban_furniture?schema=public"
   JWT_SECRET="your_secret_jwt_key_here"
   PORT=5005
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed Demo Dataset**:
   Populates the database with 30 Contacts, 40 Products, Chart of Accounts, Journals, Budgets, 60 Sales Orders, 40 Purchase Orders, and Operating Expenses.
   ```bash
   npm run seed
   ```

6. **Start Backend Server**:
   ```bash
   npm run dev
   # API Server starts on http://localhost:5005
   ```

---

### 2️⃣ Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   # Web app starts on http://localhost:5173
   ```

---

## 🔑 Demo Account Credentials

Use any of the seeded credentials below to explore different role perspectives:

| Role | Name | Login ID | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Administrator | `admin` | `Admin@123!` | Full system control & User Creation |
| **ACCOUNTANT** | Senior Accountant | `accountant` | `Acc@123!` | Full accounting, sales, purchasing & reports |
| **ACCOUNTANT** | Jay Mehta (CA) | `ca.jay` | `Cajay@1234` | Financial oversight & reporting |
| **CONTACT_USER** | Nimesh Pathak | `nimesh` | `User@123!` | Customer Portal access (Apex Interiors) |
| **CONTACT_USER** | Priya Sharma | `priya` | `User@123!` | Customer Portal access (Sharma Living) |

---

## 🛠️ Database Management & Utilities

- **Open Prisma Studio**:
  To inspect database tables visually:
  ```bash
  cd backend
  npm run prisma:studio
  ```
- **Re-seed Data**:
  ```bash
  cd backend
  npm run seed
  ```
