import { prisma } from "../../lib/prisma";
import ClinicCard from "../../components/ClinicCard";
import Pagination from "../../components/Pagination";

type Params = {
  searchParams?: {
    q?: string;
    city?: string;
    specialty?: string;
    page?: string;
    perPage?: string;
  };
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr.filter(Boolean) as any));
}

export default async function ClinicsPage({ searchParams }: Params) {
  const q = (searchParams?.q || "").trim();
  const city = (searchParams?.city || "").trim();
  const specialty = (searchParams?.specialty || "").trim();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const perPage = Math.max(1, parseInt(searchParams?.perPage || "12", 10) || 12);

  // Options
  const [allClinics, allSpecs] = await Promise.all([
    prisma.clinic.findMany({ include: { clinicSpecialties: { include: { specialty: true } } } }),
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
  ]);
  const cityOptions = uniq(allClinics.map(c => c.city)).sort();
  const specOptions = allSpecs.map(s => s.name);

  // Where
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { city: { contains: q } },
    ];
  }
  if (city) where.city = city;
  if (specialty) {
    where.clinicSpecialties = { some: { specialty: { name: specialty } } };
  }

  const total = await prisma.clinic.count({ where });
  const clinics = await prisma.clinic.findMany({
    where,
    orderBy: { name: "asc" },
    include: { clinicSpecialties: { include: { specialty: true } } },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Clinics</h1>

      <form className="card grid md:grid-cols-4 gap-3" method="get">
        <div className="grid gap-1">
          <label>Search</label>
          <input name="q" defaultValue={q} placeholder="Name or city" />
        </div>
        <div className="grid gap-1">
          <label>City</label>
          <select name="city" defaultValue={city}>
            <option value="">All</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
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
          <a className="badge" href="/clinics">Clear filters</a>
        </div>
        <input type="hidden" name="perPage" value={perPage} />
      </form>

      {clinics.length === 0 && <p className="text-gray-500">No clinics match your filters.</p>}
      <div className="grid gap-4">
        {clinics.map((c) => <ClinicCard key={c.id} clinic={c} />)}
      </div>

      <Pagination page={page} perPage={perPage} total={total} params={{ q, city, specialty }} />
    </div>
  );
}
