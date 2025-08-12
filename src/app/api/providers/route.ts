// src/app/api/providers/route.ts

import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // <-- ADD THIS LINE

export async function GET() {
  const providers = await prisma.provider.findMany({ include: { clinic: true }, orderBy: { name: "asc" } });
  return NextResponse.json(providers);
}
