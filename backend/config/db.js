const { Pool } = require("pg");

const pool = new Pool({
 user: "Riya_DMC",           // your postgres username
  host: "20.198.99.10",
  database: "Riya_DMCLead",   // your database name
  password: "adffRG#$IGFe123",  // your postgres password
  port: 5432,
});

module.exports = pool;