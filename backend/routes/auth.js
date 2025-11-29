import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";

const router = express.Router();

// ---- LOGIN ----
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ? LIMIT 1",
        [email]
    );

    if (rows.length === 0)
        return res.status(400).json({ message: "Utilisateur introuvable" });

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        "SECRET_KEY",
        { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// ---- REGISTER (Seul admin peut créer un utilisateur) ----
router.post("/register", async (req, res) => {
    const { email, password, role } = req.body;

    // Vérifier que l'utilisateur n'existe pas déjà
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
        return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        [email, hashedPassword, role]
    );

    res.json({ message: "Utilisateur créé avec succès !" });
});

export default router;
