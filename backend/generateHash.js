// generateHash.js
import bcrypt from 'bcrypt';

const password = 'Admin16522@vecna'; // Your new plain password
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('Hashed Password:', hash);
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });
