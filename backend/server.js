const express = require('express');
const cors = require ('cors');
const path = require ("path");
// const mysql = require('mysql2/promise');
 
const app = express();
app.use(cors());
app.use(express.json());

app.use("/images", express.static("images"));

app.use("/riya_dmclead", require("./routes/auth.routes"));
app.use("/riya_dmclead", require("./routes/lead.routes"));
// app.use("/riya_institute", require("./routes/student.routes"));

const PORT = process.env.PORT || 8081;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));

app.use(express.static(path.join(__dirname, "login-signup/build")));
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "login-signup/build/index.html")
  );
});
 