import express from "express";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// GET all users
router.get("/", authMiddleware, requireRole("admin"), async (req, res) => {
  const [users] = await db.query("SELECT id, email, role, created_at FROM users ORDER BY id DESC");
  res.json(users);
});

// GET single user
router.get("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  const [users] = await db.query("SELECT id, email, role FROM users WHERE id = ?", [req.params.id]);
  res.json(users[0]);
});

// CREATE user
router.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [email, hashedPassword, role]);
  res.json({ message: "Utilisateur créé !" });
});

// UPDATE user
router.put("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  const { email, role } = req.body;
  await db.query("UPDATE users SET email = ?, role = ? WHERE id = ?", [email, role, req.params.id]);
  res.json({ message: "Utilisateur mis à jour !" });
});

// DELETE user
router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({ message: "Utilisateur supprimé !" });
});

export default router;
