import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

type Search = { status?: string; page?: string };

function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const color =
    s === "CONFIRMED" ? "#16a34a" :
    s === "PENDING"   ? "#f59e0b" :
    s === "CANCELLED" ? "#dc2626" :
    s === "COMPLETED" ? "#0891b2" :
    "#6b7280";
  return (
    <span
      style={{
        backgroundColor: color,
        color: "#fff",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        whiteSpace: "nowrap"
      }}
    >
      {s}
    </span>
  );
}

// Server actions for inline Cancel / Reinstate
export async function cancelBooking(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/admin/bookings");
}

export async function reinstateBooking(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.booking.update({ where: { id }, data: { status: "CONFIRMED" } });
  revalidatePath("/admin/bookings");
}

export default async function AdminBookings({ searchParams }: { searchParams: Search }) {
  const status = (searchParams.status || "ALL").toUpperCase();
  const where = status === "ALL" ? {} : { status };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { slot: { include: { clinic: true, provider: true } } },
    take: 50, // simple cap; we can add pagination later
  });

  const filterValue = status;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bookings</h1>

        <form action="/admin/bookings" method="get" className="flex items-center gap-2">
  	  <label className="text-sm">Status</label>
  	  <select
    	    name="status"
    	    defaultValue={filterValue}
    	    className="input"
    	    style={{ padding: "6px 10px" }}
  	  >
    	    <option value="ALL">All</option>
    	    <option value="PENDING">Pending</option>
    	    <option value="CONFIRMED">Confirmed</option>
   	    <option value="COMPLETED">Completed</option>
   	    <option value="CANCELLED">Cancelled</option>
 	 </select>
 	 <button className="btn" style={{ padding: "8px 14px" }}>Apply</button>
	</form>

      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Created</th>
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pr-3">Clinic</th>
              <th className="py-2 pr-3">Provider</th>
              <th className="py-2 pr-3">Patient</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const s = b.slot;
              const when = new Date(s.startsAt);
              const isCancelled = b.status?.toUpperCase() === "CANCELLED";
              return (
                <tr key={b.id} className="border-b last:border-0 align-top">
                  <td className="py-2 pr-3">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="py-2 pr-3">
                    {when.toLocaleDateString()}{" "}
                    {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    <div className="text-gray-500 text-xs">{s.durationMin} min</div>
                  </td>
                  <td className="py-2 pr-3">{s.clinic?.name} ({s.clinic?.city})</td>
                  <td className="py-2 pr-3">{s.provider?.name}</td>
                  <td className="py-2 pr-3">
                    {b.patientName}<br />
                    <span className="text-gray-500">{b.patientEmail}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <StatusBadge status={b.status || "CONFIRMED"} />
                  </td>
                  <td className="py-2 pr-3">
                    <div className="flex gap-2 items-center">
                      <Link className="underline" href={`/booking/${b.id}`}>Open</Link>

                      {!isCancelled ? (
                        <form action={cancelBooking}>
                          <input type="hidden" name="id" value={b.id} />
                          <button
                            className="underline"
                            style={{ color: "#dc2626" }}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <form action={reinstateBooking}>
                          <input type="hidden" name="id" value={b.id} />
                          <button
                            className="underline"
                            style={{ color: "#16a34a" }}
                          >
                            Reinstate
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td className="py-6 text-gray-500" colSpan={7}>No bookings found for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
