 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const pool = require("../config/db");


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
   if (!email || !password)
      return res.status(400).json({ error: "Email & password required" });

    const result = await pool.query(
      "SELECT * FROM user_auth WHERE LOWER(email_id) = LOWER($1)",
      [email.trim()]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "User not found" });

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    
    if(!isMatch)
      return res.status(401).json({error: "Invalid Password"})
   
    const token = jwt.sign({
      user_id: user.user_id, role: user.roleuser},
    "mySecretKey123", {expiresIn:"1d"});


   console.log("user.roleuser:", user.roleuser);

    res.json({
      message: "Login Successful",
      token,
      role: user.roleuser,
      username: user.username,
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};