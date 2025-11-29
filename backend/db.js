import mysql from "mysql2/promise";

export const db = await mysql.createPool({
    host: "",
    user: "",
    password: "",
    database: ""
});
