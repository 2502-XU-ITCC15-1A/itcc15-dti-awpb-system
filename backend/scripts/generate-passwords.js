const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const password = 'password123';
  const hash1 = await bcrypt.hash(password, 10);
  const hash2 = await bcrypt.hash(password, 10);
  
  console.log('Password hashes for "password123":');
  console.log('Hash 1:', hash1);
  console.log('Hash 2:', hash2);
  
  // Verify they work
  const isValid1 = await bcrypt.compare(password, hash1);
  const isValid2 = await bcrypt.compare(password, hash2);
  
  console.log('Verification 1:', isValid1);
  console.log('Verification 2:', isValid2);
}

generatePasswords().catch(console.error);
