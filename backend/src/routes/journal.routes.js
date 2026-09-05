import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
// TODO: import controller functions once implemented, mirroring contact.controller.js
// import { listJournals, getJournal, createJournal, updateJournal } from "../controllers/journal.controller.js";

const router = Router();
router.use(requireAuth);

// GET /api/journals          -> listJournals
// GET /api/journals/:id      -> getJournal
// POST /api/journals         -> createJournal  (requireRole("ADMIN","ACCOUNTANT"))
// PUT /api/journals/:id      -> updateJournal  (requireRole("ADMIN","ACCOUNTANT"))

export default router;
