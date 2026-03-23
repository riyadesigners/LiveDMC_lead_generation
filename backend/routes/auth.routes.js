const router = require("express").Router();
const authController = require("../controllers/auth.controller");  // single import — uses auth.controller.js
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.get("/check-auth", verifyToken, authController.checkAuth);
router.get("/dashboard", verifyToken,
  authorizeRoles("superadmin", "admin", "user"),
  (req, res) => res.json({ message: "Welcome to Dashboard" })
);
router.post("/add-user", verifyToken, authorizeRoles("superadmin", "admin"), authController.addUser);

module.exports = router;