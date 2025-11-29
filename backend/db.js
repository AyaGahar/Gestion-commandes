import mysql from "mysql2/promise";

export const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "gest_commandes"
});
