# CareLux Health (Next.js + Prisma + Tailwind)

Rebuilt app with branding + booking and tighter UX (optimistic submission + toast).

## Quick start
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

- App routes: `/clinics`, `/providers`, `/slots`
- API routes: `/api/clinics`, `/api/providers`, `/api/slots`

## Booking
- Book on `/slots`. Creates a `Booking` row and marks `slot.booked = true`.
- Button disables with "Booking…", optimistic flip to "Booked", toast on success/error.
