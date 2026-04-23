const bcrypt = require('bcrypt');

async function hash() {
  const plain = 'Vaibhav14'; // ← put vaibhav's real password
  const hashed = await bcrypt.hash(plain, 10);
  console.log(hashed);
}

hash();