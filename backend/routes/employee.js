import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = express.Router();

// 📌 1. Commandes à traiter
router.get("/orders", authMiddleware, requireRole("employee"), async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE status IN ('en attente','payée') ORDER BY created_at DESC"
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération commandes" });
  }
});

// 📌 2. Alertes – commandes non traitées depuis X heures
router.get("/alerts", authMiddleware, requireRole("employee"), async (req, res) => {
  try {
    const hours = 24;
    const [pendingOrders] = await db.query(
      "SELECT id, customer_name, status, created_at FROM orders WHERE status = 'en attente' AND created_at <= NOW() - INTERVAL ? HOUR",
      [hours]
    );

    res.json({ pendingOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération alertes" });
  }
});

// 📌 3. Mise à jour statut commande (autorisé pour certaines valeurs)
router.put("/orders/:id/status", authMiddleware, requireRole("employee"), async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  const allowed = ["en attente", "payée", "expédiée"]; // statut que l'employé peut définir

  if (!allowed.includes(status)) {
    return res.status(403).json({ message: "Permission refusée" });
  }

  try {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Statut mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur mise à jour statut" });
  }
});

// Recherche commande par nom client
router.get("/search", authMiddleware, requireRole("employee"), (req, res) => {
    const { name } = req.query;

    if (!name) return res.status(400).json({ error: "Nom obligatoire" });

    const sql = `
        SELECT * FROM orders
        WHERE customer_name LIKE ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [`%${name}%`], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur serveur" });

        res.json(results);
    });
});

export default router;
