import { prisma } from "../../lib/prisma";
import Link from "next/link";
import Pagination from "../../components/Pagination";

type Params = {
  searchParams?: {
    q?: string;
    clinic?: string;
    specialty?: string;
    page?: string;
    perPage?: string;
  };
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean) as any));
}

export default async function ProvidersPage({ searchParams }: Params) {
  const q = (searchParams?.q || "").trim();
  const clinicId = (searchParams?.clinic || "").trim();
  const specialty = (searchParams?.specialty || "").trim();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const perPage = Math.max(1, parseInt(searchParams?.perPage || "12", 10) || 12);

  const [clinics, specialties] = await Promise.all([
    prisma.clinic.findMany({ orderBy: { name: "asc" } }),
    prisma.provider.findMany({ distinct: ["specialty"], select: { specialty: true } }),
  ]);
  const specOptions = uniq(specialties.map(s => s.specialty)).sort();

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { specialty: { contains: q } },
    ];
  }
  if (clinicId) where.clinicId = clinicId;
  if (specialty) where.specialty = specialty;

  const total = await prisma.provider.count({ where });

  const providers = await prisma.provider.findMany({
    where,
    include: { clinic: true },
    orderBy: { name: "asc" },
    skip: (page - 1) * perPage,
    take: perPage
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Providers</h1>

      <form className="card grid md:grid-cols-4 gap-3" method="get">
        <div className="grid gap-1">
          <label>Search</label>
          <input name="q" defaultValue={q} placeholder="Name or specialty" />
        </div>
        <div className="grid gap-1">
          <label>Clinic</label>
          <select name="clinic" defaultValue={clinicId}>
            <option value="">All</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-1">
          <label>Specialty</label>
          <select name="specialty" defaultValue={specialty}>
            <option value="">All</option>
            {specOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button className="btn" type="submit">Filter</button>
          <a className="badge" href="/providers">Clear filters</a>
        </div>
        <input type="hidden" name="perPage" value={perPage} />
      </form>

      {providers.length === 0 && <p className="text-gray-500">No providers match your filters.</p>}
      <div className="grid gap-4">
        {providers.map((p) => (
          <Link key={p.id} href={`/providers/${p.id}`} className="card block">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-gray-600">{p.specialty}</p>
                <p className="text-gray-600">{p.clinic?.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Pagination page={page} perPage={perPage} total={total} params={{ q, clinic: clinicId, specialty }} />
    </div>
  );
}
