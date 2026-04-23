const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
// const { error } = require("jquery");

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

    // console.log("  DB rows found:", result.rows.length); // ← ADD
    // console.log("  DB user:", result.rows[0]); // ← ADD

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    console.log(" Password match:", isMatch); // ← ADD

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

      //sameSite: "Strict",
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
     message: "Login Successful",
      username: user.username,
      user_id: user.user_id,
      role: user.roleuser,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── ADD USER ────
exports.addUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: "All Fields are required" });
    }
    //validate
    const allowedRoles = ["user", "admin", "superadmin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }
    //Check duplicate email
    const existingUsername = await pool.query(
      "SELECT user_id FROM user_auth WHERE LOWER(username) = LOWER($1)", [username.trim()]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      `INSERT INTO user_auth (username, password, email_id, roleuser)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, email_id, roleuser`,
      [username.trim(), hashedPassword, email.trim().toLowerCase(), role]
    );
    const newUser = insertResult.rows[0];
    console.log(" User Added:", newUser.user_id, newUser.username);

    res.status(201).json({
      message: `User '${newUser.username}' added successfully`,
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email_id,
        role: newUser.roleuser,
      },
    });

  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.LoginWithJWTToken = async (req, res) => {

  const { token } = req.body;

  console.log(" Login with token attempt:", token);  

  try {

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    try {



      const verified = jwt.verify(token, process.env.JWT_SECRET);

      const result = await pool.query(
        "SELECT user_id,username,roleuser FROM user_auth WHERE emp_code = $1",
        [verified.emp_code]
      );


      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid Token1" });
      }



      const user = result.rows[0];

      console.log("res:", user);


      const tokenNew = jwt.sign(
        { user_id: user.user_id, role: user.roleuser },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.cookie("token", tokenNew, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",

        //sameSite: "Strict",
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // res.json({
      //  message: "Login Successful",
      // username: user.username,
      // user_id: user.user_id,
      // role: user.roleuser,
      // });

      return res.status(401).json({ error: "Invalid Token2 " });

//       return res.json({
//   message: "Login Successful",
//   username: user.username,
//   user_id: user.user_id,
//   role: user.roleuser,
// });

    } catch (err) {

      return res.status(401).json({ error: "Invalid Token2 " + err.message });
    }

  }
  catch (err) {

    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });

  }

};


// exports.checkAuth = (req, res) => {
//   res.json({
//     user_id: req.user.user_id,
//     role: req.user.role,
//   });
// };