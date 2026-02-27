const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("📩 Login attempt:", email, password); // ← ADD

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email & password required" });
    }

    const result = await pool.query(
      "SELECT * FROM user_auth WHERE LOWER(email_id) = LOWER($1)",
      [email.trim()]
    );

    // console.log("🔍 DB rows found:", result.rows.length); // ← ADD
    // console.log("🔍 DB user:", result.rows[0]); // ← ADD

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    console.log("🔐 Password match:", isMatch); // ← ADD

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.roleuser },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      
      // sameSite: "Strict",
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login Successful",
      username: user.username,
      role: user.roleuser,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};