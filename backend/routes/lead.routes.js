
const router = require("express").Router();
 
const { createLead, checkInvoice, getLeadList, getInvoice, getLeadById, updateLead } = require("../controllers/lead.controller");

router.get("/checkInvoice/:invoiceNo", checkInvoice);
router.post("/createLead", createLead);
router.put("/updateLead/:id", updateLead);
router.get("/getLeadList", getLeadList);
router.get("/getInvoice/:id", getInvoice);
router.get("/getLead/:id", getLeadById);

// router.get("/leads/:leadId", lead.getLeadById);
// router.get("/getInvoice/:id", getInvoice);


module.exports = router;



 