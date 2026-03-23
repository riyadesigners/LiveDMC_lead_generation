
const router = require("express").Router();
 
const { createLead, checkInvoice, getLeadList, getInvoice, getLeadById, updateLead } = require("../controllers/lead.controller");

const {verifyToken} = require("../middleware/authMiddleware");

router.get("/checkInvoice/:invoiceNo",verifyToken, checkInvoice);
router.post("/createLead", verifyToken, createLead);
router.put("/updateLead/:id", verifyToken, updateLead);
router.get("/getLeadList", verifyToken, getLeadList);
router.get("/getInvoice/:id", verifyToken, getInvoice);
router.get("/getLead/:id", verifyToken, getLeadById);

// router.get("/leads/:leadId", lead.getLeadById);
// router.get("/getInvoice/:id", getInvoice);


module.exports = router;



 