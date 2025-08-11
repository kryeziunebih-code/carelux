import Link from "next/link";
export default function ClinicCard({ clinic }: { clinic: any }) {
  const specs =
    Array.isArray(clinic?.clinicSpecialties)
      ? clinic.clinicSpecialties.map((cs: any) => cs?.specialty?.name).filter(Boolean)
      : [];
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{clinic.name}</h3>
          <p className="text-gray-600">{clinic.city}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {specs.map((s: string) => (
              <span key={s} className="badge">{s}</span>
            ))}
          </div>
        </div>
        <Link href={`/clinics/${clinic.id}`} className="badge">View</Link>
      </div>
    </div>
  );
}
