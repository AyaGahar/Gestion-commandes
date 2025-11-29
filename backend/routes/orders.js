// backend/routes/orders.js
import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/orders
 * Body: { customer_name, items: [{ product_id, quantity }] }
 */
router.post("/", authMiddleware, async (req, res) => {
  const userId = req.user?.id;
  const { customer_name, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Panier vide" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Récupérer les produits commandés
    const ids = items.map(i => i.product_id);
    const [products] = await conn.query(
      `SELECT id, name, price, quantity FROM products 
       WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids
    );

    const prodMap = new Map(products.map(p => [p.id, p]));

    let total = 0;
    for (const it of items) {
      const p = prodMap.get(Number(it.product_id));
      if (!p) throw new Error(`Produit introuvable id=${it.product_id}`);

      const q = Number(it.quantity);
      if (q <= 0) throw new Error(`Quantité invalide pour produit ${p.name}`);
      if (p.quantity < q) throw new Error(`Stock insuffisant pour ${p.name} (disponible: ${p.quantity})`);

      it.price = Number(p.price);
      it.subtotal = Number((p.price * q).toFixed(2));
      it.name = p.name;
      total += it.subtotal;
    }
    total = Number(total.toFixed(2));

    // Insérer la commande
    const [orderResult] = await conn.query(
      "INSERT INTO orders (user_id, customer_name, total, status) VALUES (?, ?, ?, ?)",
      [userId || null, customer_name || null, total, "en attente"]
    );
    const orderId = orderResult.insertId;

    // Insérer les items et réduire le stock
    for (const it of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)",
        [orderId, it.product_id, it.quantity, it.price, it.subtotal]
      );
      await conn.query(
        "UPDATE products SET quantity = quantity - ? WHERE id = ?",
        [it.quantity, it.product_id]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Commande créée", orderId });

  } catch (err) {
    await conn.rollback();
    console.error("Create order error:", err);
    res.status(400).json({ message: err.message || "Erreur création commande" });
  } finally {
    conn.release();
  }
});

/**
 * GET /api/orders
 * Query params: page, limit, status, customer
 */
router.get("/", authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { status, customer } = req.query;

  try {
    let where = [];
    let params = [];

    if (status) {
      where.push("o.status = ?");
      params.push(status);
    }
    if (customer) {
      where.push("o.customer_name LIKE ?");
      params.push(`%${customer}%`);
    }

    const whereSQL = where.length ? "WHERE " + where.join(" AND ") : "";

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM orders o ${whereSQL}`, params);
    const totalPages = Math.ceil(total / limit);

    const [orders] = await db.query(
      `SELECT o.*, u.email AS created_by
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${whereSQL}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({ orders, currentPage: page, totalPages, total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération commandes" });
  }
});

/**
 * GET /api/orders/:id
 */
router.get("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const [[order]] = await db.query(
      `SELECT o.*, u.email AS created_by
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    const [items] = await db.query(
      `SELECT oi.*, p.name AS product_name, p.image AS product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ order, items });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération commande" });
  }
});

/**
 * PUT /api/orders/:id/status
 */
// PUT /api/orders/:id/status
router.put("/:id/status", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const allStatuses = ["en attente", "payée", "expédiée", "annulée"];
  if (!allStatuses.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  // Vérification rôle
  const userRole = req.user.role; // récupéré via authMiddleware
  const employeeAllowed = ["en attente", "payée", "expédiée"];

  if (userRole === "employee" && !employeeAllowed.includes(status)) {
    return res.status(403).json({ message: "Permission refusée : employé ne peut pas définir ce statut" });
  }

  try {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Statut mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur mise à jour statut" });
  }
});

/**
 * DELETE /api/orders/:id
 * Restaure le stock automatiquement
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [id]
    );

    for (const it of items) {
      await conn.query(
        "UPDATE products SET quantity = quantity + ? WHERE id = ?",
        [it.quantity, it.product_id]
      );
    }

    await conn.query("DELETE FROM orders WHERE id = ?", [id]);

    await conn.commit();
    res.json({ message: "Commande supprimée et stock restauré" });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur suppression commande" });

  } finally {
    conn.release();
  }
});

export default router;
