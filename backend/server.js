const express = require('express');
const cors = require('cors');
const path = require("path");
// const mysql = require('mysql2/promise');
const pool = require("./config/db");

const cookieParser = require("cookie-parser");
require("dotenv").config({ debug: true });
pool.connect()
  .then(() => console.log(" PostgreSQL Connected"))
  .catch(err => console.error("Connection Error:", err));

const app = express();

 
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081', 'https://sso.riya.travel'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());


app.use("/images", express.static("images"));

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

app.use("/", require("./routes/auth.routes"));
app.use("/", require("./routes/lead.routes"));



app.use(express.static(path.join(__dirname, "login-signup/build")));
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "login-signup/build/index.html")
  );
});

// app.use(express.static(path.join(__dirname, "../build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../build", "index.html"));
// });