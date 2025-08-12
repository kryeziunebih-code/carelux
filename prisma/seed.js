// prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.service.deleteMany(); // Clear services
  await prisma.clinicSpecialty.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@carelux.app";
  const adminPassword = process.env.ADMIN_INIT_PASSWORD || "password";
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      name: "Admin",
    },
  });
  console.log("Admin user created/updated:", adminUser.email);

  // Create Clinics
  const clinic1 = await prisma.clinic.create({
    data: {
      name: "Wellness Clinic",
      city: "Zurich",
    },
  });
  console.log("Created clinic:", clinic1.name);

  // Create Providers
  const provider1 = await prisma.provider.create({
    data: {
      name: "Dr. Smith",
      specialty: "Cardiology",
      clinicId: clinic1.id,
    },
  });
  const provider2 = await prisma.provider.create({
    data: {
      name: "Dr. Jones",
      specialty: "Dermatology",
      clinicId: clinic1.id,
    },
  });
  console.log("Created providers: Dr. Smith, Dr. Jones");

  // --- NEW: Create Services for the clinic ---
  const service1 = await prisma.service.create({
    data: {
      name: 'Annual Checkup',
      description: 'A comprehensive annual health checkup.',
      durationMin: 60,
      price: 250.0,
      clinicId: clinic1.id,
    }
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Follow-up Visit',
      description: 'A standard follow-up appointment.',
      durationMin: 30,
      price: 120.0,
      clinicId: clinic1.id,
    }
  });
  console.log("Created services:", service1.name, service2.name);


  // --- UPDATED: Create Slots linked to services ---
  const today = new Date();
  const slots = [];
  for (let i = 0; i < 5; i++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + i);
    
    // Slot for Annual Checkup with Dr. Smith
    slotDate.setHours(9, 0, 0, 0);
    slots.push(
      prisma.slot.create({
        data: {
          startsAt: slotDate,
          clinicId: clinic1.id,
          providerId: provider1.id,
          serviceId: service1.id, // Link to service 1
        },
      })
    );
    
    // Slot for Follow-up Visit with Dr. Jones
    slotDate.setHours(14, 0, 0, 0);
    slots.push(
      prisma.slot.create({
        data: {
          startsAt: slotDate,
          clinicId: clinic1.id,
          providerId: provider2.id,
          serviceId: service2.id, // Link to service 2
        },
      })
    );
  }

  await Promise.all(slots);
  console.log("Created 10 slots");

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
