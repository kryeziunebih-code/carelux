// src/app/api/slots/route.ts

import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // <-- ADD THIS LINE

export async function GET() {
  const slots = await prisma.slot.findMany({ include: { clinic: true, provider: true }, orderBy: { startsAt: "asc" } });
  return NextResponse.json(slots);
}
