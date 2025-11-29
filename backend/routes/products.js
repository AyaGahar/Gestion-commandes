import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import multer from "multer"; 
import path from "path";

const router = express.Router();

// Configurer multer pour images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// ---- GET ALL PRODUCTS avec pagination et option search ----
router.get("/", authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?",
      [`%${search}%`, limit, offset]
    );

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM products WHERE name LIKE ?",
      [`%${search}%`]
    );

    res.json({
      products: rows,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération produits" });
  }
});

// ---- GET ONE PRODUCT ----
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  res.json(rows[0]);
});

// ---- ADD PRODUCT (admin only) ----
router.post("/", upload.single("image"), requireRole("admin"), async (req, res) => {
  const { name, price, quantity } = req.body;
  const image = req.file ? req.file.filename : "default.jpg";

  await db.query(
    "INSERT INTO products (name, price, quantity, image) VALUES (?, ?, ?, ?)",
    [name, price, quantity, image]
  );

  res.json({ message: "Produit ajouté avec succès !" });
});

// ---- UPDATE PRODUCT ----
router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  await db.query(
    "UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ?",
    [name, price, quantity, id]
  );

  res.json({ message: "Produit mis à jour" });
});

// ---- DELETE PRODUCT ----
router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM products WHERE id = ?", [id]);
  res.json({ message: "Produit supprimé" });
});

export default router;
