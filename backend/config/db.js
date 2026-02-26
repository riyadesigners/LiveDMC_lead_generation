const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",           // your postgres username
  host: "localhost",
  database: "riya_dmclead",   // your database name
  password: "root",  // your postgres password
  port: 5433,
});

module.exports = pool;