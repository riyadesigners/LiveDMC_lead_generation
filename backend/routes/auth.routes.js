const router = require("express").Router();
const { login } = require("../controllers/auth.controller");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/check-auth", verifyToken, (req, res) => {
  res.json({ message: "Authenticated", user: req.user });
});
router.get("/dashboard", verifyToken,
    authorizeRoles("superadmin", "admin", "user"),
    (req, res) => {
        res.json({ message: "Welcome to Dashboard" });
    }
);

module.exports = router;