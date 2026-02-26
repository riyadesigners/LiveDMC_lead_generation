const bcrypt = require("bcrypt");

(async () => {
  try {
    const password = "Seenumathew1"; // change if needed
    const hashed = await bcrypt.hash(password, 10);
    console.log("Hashed Password:");
    console.log(hashed);
  } catch (err) {
    console.error(err);
  }
})();