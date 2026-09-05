import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
// TODO: import controller functions once implemented, mirroring contact.controller.js
// import { listProducts, getProduct, createProduct, updateProduct } from "../controllers/product.controller.js";

const router = Router();
router.use(requireAuth);

// GET /api/products          -> listProducts
// GET /api/products/:id      -> getProduct
// POST /api/products         -> createProduct  (requireRole("ADMIN","ACCOUNTANT"))
// PUT /api/products/:id      -> updateProduct  (requireRole("ADMIN","ACCOUNTANT"))

export default router;
