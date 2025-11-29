import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { requireRole } from "./middleware/role.js";
import productsRoutes from "./routes/products.js";
import path from "path";
import adminRoutes from "./routes/admin.js";
import orderRoutes from "./routes/orders.js";
import employeeRoutes from "./routes/employee.js";
import usersRouter from "./routes/users.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes publiques
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/employee", employeeRoutes);

app.use("/api/users", usersRouter);

// Exemples routes protégées
app.get("/api/admin/dashboard", authMiddleware, requireRole("admin"), (req, res) => {
    res.json({ message: "Bienvenue Admin", user: req.user });
});

app.get("/api/employee/dashboard", authMiddleware, requireRole("employee"), (req, res) => {
    res.json({ message: "Bienvenue Employé", user: req.user });
});






app.listen(5000, () => console.log("Serveur lancé sur port 5000"));
