import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// 📌 Statistiques globales + total CA + produits faibles stocks
router.get("/stats", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    // Total utilisateurs, produits, commandes
    const [[{ totalUsers }]] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[{ totalProducts }]] = await db.query("SELECT COUNT(*) AS totalProducts FROM products");
    const [[{ totalOrders }]] = await db.query("SELECT COUNT(*) AS totalOrders FROM orders");

    // Total chiffre d'affaires (commandes payées ou expédiées)
    const [[{ totalRevenue }]] = await db.query(
      "SELECT SUM(total) AS totalRevenue FROM orders WHERE status IN ('payée','expédiée')"
    );

    // Produits en rupture ou faibles stocks (seuil = 5)
    const [lowStockProducts] = await db.query(
      "SELECT id, name, quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC"
    );

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue || 0,
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération stats admin" });
  }
});

// 📌 Dernières commandes
router.get("/latest-orders", authMiddleware, requireRole("admin"), async (req, res) => {
  const [rows] = await db.query(
    "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5"
  );
  res.json(rows);
});

// 📌 Liste rapide des utilisateurs
router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  const [rows] = await db.query("SELECT id, email, role FROM users");
  res.json(rows);
});

// GET /api/admin/alerts
router.get("/alerts", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    // Produits avec stock faible
    const [lowStockProducts] = await db.query(
      "SELECT id, name, quantity FROM products WHERE quantity <= 5 ORDER BY quantity ASC"
    );

    // Commandes non traitées depuis X heures (ex: 24h)
    const hours = 24;
    const [pendingOrders] = await db.query(
      "SELECT id, customer_name, status, created_at FROM orders WHERE status = 'en attente' AND created_at <= NOW() - INTERVAL ? HOUR",
      [hours]
    );

    res.json({
      lowStockProducts,
      pendingOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération alertes" });
  }
});


export default router;
