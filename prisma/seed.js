// prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

(async () => {
  // 1) Admin user (your schema uses passwordHash)
  const email = process.env.ADMIN_EMAIL || 'admin@carelux.com';
  const pass  = process.env.ADMIN_INIT_PASSWORD || 'CareluxAdmin123';
  const hash  = bcrypt.hashSync(String(pass), 10);

  const admin = await prisma.user.findUnique({ where: { email } });
  if (admin) {
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN', passwordHash: hash, name: 'Admin' } });
  } else {
    await prisma.user.create({ data: { email, role: 'ADMIN', passwordHash: hash, name: 'Admin' } });
  }

  // 2) Clinic (name is unique)
  const clinic = await prisma.clinic.upsert({
    where: { name: 'CareLux Test Clinic' },
    update: {},
    create: { name: 'CareLux Test Clinic', city: 'Luxembourg' },
  });

  // helper to get/create provider by (name, clinicId)
  async function getOrCreateProvider({ name, specialty }) {
    const existing = await prisma.provider.findFirst({
      where: { name, clinicId: clinic.id },
    });
    if (existing) return existing;
    return prisma.provider.create({ data: { name, clinicId: clinic.id, specialty } });
  }

  // 3) Providers (no email field in your schema)
  const dr1 = await getOrCreateProvider({ name: 'Dr. Sarah Mitchell', specialty: 'Dermatology' });
  const dr2 = await getOrCreateProvider({ name: 'Dr. James Carter',   specialty: 'Pediatrics'  });

  // 4) Slots (next 7 days, 10:00 & 11:00 for each provider) — avoid duplicates by checking same timestamp
  async function ensureSlot({ providerId, startsAt, durationMin }) {
    const existing = await prisma.slot.findFirst({
      where: { providerId, startsAt },
    });
    if (existing) return existing;
    return prisma.slot.create({ data: { providerId, clinicId: clinic.id, startsAt, durationMin } });
  }

  const providers = [dr1, dr2];
  const slots = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    for (const p of providers) {
      const base = new Date(addDays(today, i)); base.setHours(10, 0, 0, 0);
      const s1 = await ensureSlot({ providerId: p.id, startsAt: base, durationMin: 30 });
      const s2 = await ensureSlot({ providerId: p.id, startsAt: new Date(base.getTime() + 60 * 60 * 1000), durationMin: 30 });
      slots.push(s1, s2);
    }
  }

  // 5) Bookings (mixed statuses) — only create if none exists for that slot yet
  async function ensureBooking({ slot, patientName, patientEmail, status }) {
    const existing = await prisma.booking.findFirst({ where: { slotId: slot.id } });
    if (existing) return existing;
    return prisma.booking.create({
      data: { slotId: slot.id, patientName, patientEmail, status },
    });
  }

  const pick = (i) => slots[i % slots.length];
  await ensureBooking({ slot: pick(0), patientName: 'John Doe',     patientEmail: 'customer@test.com',  status: 'CONFIRMED' });
  await ensureBooking({ slot: pick(1), patientName: 'Jane Smith',   patientEmail: 'customer2@test.com', status: 'PENDING'   });
  await ensureBooking({ slot: pick(2), patientName: 'Chris Lee',    patientEmail: 'customer3@test.com', status: 'CANCELLED' });
  await ensureBooking({ slot: pick(3), patientName: 'Alicia Brown', patientEmail: 'customer4@test.com', status: 'COMPLETED' });

  console.log('✅ Seed complete: admin, clinic, providers, slots, bookings.');
})()
.catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
.finally(async () => { await prisma.$disconnect(); });
