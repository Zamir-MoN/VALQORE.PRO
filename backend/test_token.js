const jwt = require('jsonwebtoken');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const secret = env.split('\n').find(line => line.startsWith('JWT_SECRET=')).split('=')[1].replace(/"/g, '');
const admin = env.split('\n').find(line => line.startsWith('ADMIN_USERNAME=')).split('=')[1].replace(/"/g, '');

const token = jwt.sign(
  { username: admin },
  secret,
  { expiresIn: '1h' }
);
console.log(token);
