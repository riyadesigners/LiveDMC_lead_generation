const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password:"",
  
  database: "riya_dmclead",
 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

// const mysql = require("mysql2/promise");

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root_riyaedu",
//   password: "bcPYahpRcNsqCw9w",
//   database: "riya_edu_demo",
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // 🔍 Test DB connection
// (async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log("✅ MySQL Database connected successfully");
//     connection.release();
//   } catch (error) {
//     console.error("❌ MySQL Database connection failed");
//     console.error(error.message);
//   }
// })();

// module.exports = pool;
