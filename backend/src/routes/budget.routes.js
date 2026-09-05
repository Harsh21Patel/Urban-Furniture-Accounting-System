import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
// TODO: import controller functions once implemented, mirroring contact.controller.js
// import { listBudgets, getBudget, createBudget, updateBudget } from "../controllers/budget.controller.js";

const router = Router();
router.use(requireAuth);

// GET /api/budgets          -> listBudgets
// GET /api/budgets/:id      -> getBudget
// POST /api/budgets         -> createBudget  (requireRole("ADMIN","ACCOUNTANT"))
// PUT /api/budgets/:id      -> updateBudget  (requireRole("ADMIN","ACCOUNTANT"))

export default router;
