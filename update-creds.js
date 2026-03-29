const bcrypt = require('bcryptjs');
const fs = require('fs');

const password = 'Nic@9984';
const hash = bcrypt.hashSync(password, 10);
console.log('Password:', password);
console.log('Hash:', hash);

// Just to be extremely safe, format the JSON programmatically:
const data = {
  email: "aaswfoundation06@gmail.com",
  passwordHash: hash
};
fs.writeFileSync('data/credentials.json', JSON.stringify(data, null, 2));
console.log('Updated credentials.json');
