"use server";

import { prisma } from "../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelBooking(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin/bookings");
}

export async function reinstateBooking(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
  revalidatePath("/admin/bookings");
}
