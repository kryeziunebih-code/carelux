'use server';

import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelBooking(id: string) {
  await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin/bookings");
}

export async function reinstateBooking(id: string) {
  await prisma.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
  revalidatePath("/admin/bookings");
}
