import Link from "next/link";

function qs(params: Record<string, any>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  });
  return `?${search.toString()}`;
}

export default function Pagination({
  page, perPage, total, params = {} as Record<string,string|number|undefined>,
}: {
  page: number; perPage: number; total: number;
  params?: Record<string, string | number | undefined>;
}) {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);

  const prev = Math.max(1, page - 1);
  const next = Math.min(lastPage, page + 1);

  const base = { ...params, perPage };

  return (
    <div className="flex items-center justify-between mt-2">
      <div className="text-sm text-gray-600">
        Showing {start}–{end} of {total}
      </div>
      <div className="flex gap-2">
        <Link
          className={`badge ${page<=1 ? "pointer-events-none opacity-50" : ""}`}
          href={qs({ ...base, page: prev })}
          aria-disabled={page<=1}
        >
          ← Prev
        </Link>
        <Link
          className={`badge ${page>=lastPage ? "pointer-events-none opacity-50" : ""}`}
          href={qs({ ...base, page: next })}
          aria-disabled={page>=lastPage}
        >
          Next →
        </Link>
      </div>
    </div>
  );
}
