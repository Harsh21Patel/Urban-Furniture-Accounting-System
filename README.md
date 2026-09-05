# Urban Furniture — Accounting System

24-hour hackathon build. Stack: React (Vite) + Node/Express + PostgreSQL (Prisma).

## Structure
- `backend/` — Express API, Prisma schema, auth, business logic (journal entries, reports)
- `frontend/` — React app (list/kanban/form views, dashboard, reports)

## Quick start

### Backend
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev                # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

## Build priority (24hr plan)
1. Auth + roles (Admin / Accountant / Contact)
2. Master data CRUD (Contacts, Products, Chart of Accounts, Journals)
3. Transaction flow (PO→Bill→Payment, SO→Invoice→Payment) with auto journal entries
4. Reports (Balance Sheet, P&L, Budget) as ledger aggregations
5. Polish + deploy
