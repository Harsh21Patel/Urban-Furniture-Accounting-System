import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
// TODO: import controller functions once implemented, mirroring contact.controller.js
// import { listAccounts, getAccount, createAccount, updateAccount } from "../controllers/account.controller.js";

const router = Router();
router.use(requireAuth);

// GET /api/accounts          -> listAccounts
// GET /api/accounts/:id      -> getAccount
// POST /api/accounts         -> createAccount  (requireRole("ADMIN","ACCOUNTANT"))
// PUT /api/accounts/:id      -> updateAccount  (requireRole("ADMIN","ACCOUNTANT"))

export default router;
