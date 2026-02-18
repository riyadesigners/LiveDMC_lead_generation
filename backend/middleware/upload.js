const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "images/pic";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const studentId = req.studentCode || "TEMP";
    const ext = path.extname(file.originalname);
    const base = file.fieldname;
    cb(null, `${studentId}_${base}_${Date.now()}${ext}`);
  }
});

 
module.exports = multer({ storage }).any();
