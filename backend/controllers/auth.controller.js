const pool = require("../config/db");

exports.login  = async (req, res) => {
const {email, password} = req.body;
  try {
if(!email || !password)
    return res.status(400).json({error: "email & password required"});
const [rows] = await pool.query(
  "SELECT * FROM user_auth WHERE email_id = ? LIMIT 1",
    [email]  
);
if(!rows.length || rows[0].password !== password)
    return res.status(401).json({ error: "Invalid credentials"});
res.json({
    message: "Login Successful",
    userID: rows[0].user_id,
    username: rows[0].username,
    email : rows[0].email_id
});

} catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};