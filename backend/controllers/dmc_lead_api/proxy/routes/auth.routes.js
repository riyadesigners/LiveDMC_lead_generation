const router = require("express").Router();
const authController = require("../controllers/auth.controller");  // single import — uses auth.controller.js
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/LoginWithJWTToken", authController.LoginWithJWTToken);
// router.get("/check-auth", verifyToken, authController.checkAuth);
router.get("/dashboard", verifyToken,
  authorizeRoles("superadmin", "admin", "user"),
  (req, res) => res.json({ message: "Welcome to Dashboard" })
);
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.json({ message: "Logged out" });
});
router.post("/add-user", verifyToken, authorizeRoles("superadmin", "admin"), authController.addUser);

module.exports = router;