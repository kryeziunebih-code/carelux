import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // <-- ADD THIS LINE

export async function GET() {
  const clinics = await prisma.clinic.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(clinics);
}
