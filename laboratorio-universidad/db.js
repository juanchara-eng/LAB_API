const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "root",
  database: process.env.MYSQL_DATABASE || "universidad",
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
});

db.connect((error) => {
  if (error) {
    console.log("Error conexión:");
    console.log(error);
  } else {
    console.log("Conectado a MySQL");
  }
});

module.exports = db;
