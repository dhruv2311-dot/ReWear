#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 ReWear Security: Secret Generation Tool\n');

console.log('📋 Generating new secure secrets...\n');

// Generate cryptographically secure secrets
const secrets = {
  JWT_SECRET: crypto.randomBytes(32).toString('hex'),
  SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
  BCRYPT_ROUNDS: 12,
};

console.log('🔑 New Secrets (copy these to your .env file):\n');
console.log('='.repeat(60));

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('='.repeat(60));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Replace these in your .env file immediately');
console.log('2. Never commit .env files to version control');
console.log('3. Rotate secrets every 90 days');
console.log('4. Update all external OAuth providers');
console.log('5. Invalidate existing user sessions after rotation');

console.log('\n🔍 External Secrets to Update Manually:');
console.log('- Google OAuth: https://console.developers.google.com/');
console.log('- GitHub OAuth: https://github.com/settings/developers');
console.log('- Cloudinary: https://cloudinary.com/console');
console.log('- SMTP: Update email account password');

console.log('\n✅ Secret generation complete!');
