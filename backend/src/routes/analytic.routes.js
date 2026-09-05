import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
// TODO: import controller functions once implemented, mirroring contact.controller.js
// import { listAnalytics, getAnalytic, createAnalytic, updateAnalytic } from "../controllers/analytic.controller.js";

const router = Router();
router.use(requireAuth);

// GET /api/analytics          -> listAnalytics
// GET /api/analytics/:id      -> getAnalytic
// POST /api/analytics         -> createAnalytic  (requireRole("ADMIN","ACCOUNTANT"))
// PUT /api/analytics/:id      -> updateAnalytic  (requireRole("ADMIN","ACCOUNTANT"))

export default router;
