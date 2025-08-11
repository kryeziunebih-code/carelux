require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_INIT_PASSWORD;
    if (!email || !password) throw new Error('Missing ADMIN_EMAIL or ADMIN_INIT_PASSWORD in .env');
    const hash = bcrypt.hashSync(String(password), 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hash, role: 'ADMIN' },
      create: { email, passwordHash: hash, role: 'ADMIN', name: 'Admin' },
    });
    console.log('✅ Admin ready:', user.email);
  } catch (err) {
    console.error('[upsert-admin] Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
